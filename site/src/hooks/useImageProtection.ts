import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectionConfig {
  disableRightClick?: boolean;
  disableScreenshot?: boolean;
  blurOnDevTools?: boolean;
  trackSuspiciousActivity?: boolean;
  botTrapEnabled?: boolean;
}

export const useImageProtection = (config: ProtectionConfig = {}) => {
  const {
    disableRightClick = true,
    disableScreenshot = true,
    blurOnDevTools = true,
    trackSuspiciousActivity = true,
    botTrapEnabled = true,
  } = config;

  const devToolsOpenRef = useRef(false);
  const suspiciousActivityRef = useRef(0);

  const detectDevTools = useCallback(() => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    console.log('🔍 Détection DevTools:', {
      outerWidth: window.outerWidth,
      innerWidth: window.innerWidth,
      outerHeight: window.outerHeight,
      innerHeight: window.innerHeight,
      widthDiff: window.outerWidth - window.innerWidth,
      heightDiff: window.outerHeight - window.innerHeight,
      widthThreshold,
      heightThreshold,
      orientation,
    });

    if ((heightThreshold && orientation === 'horizontal') || 
        (widthThreshold && orientation === 'vertical')) {
      if (!devToolsOpenRef.current) {
        devToolsOpenRef.current = true;
        handleDevToolsOpen();
      }
    } else {
      if (devToolsOpenRef.current) {
        devToolsOpenRef.current = false;
        handleDevToolsClose();
      }
    }
  }, []);

  const handleDevToolsOpen = () => {
    console.warn('🛡️ DevTools détecté - Application du blur');
    
    const protectedImages = document.querySelectorAll('img[data-protected="true"]');
    console.log(`📸 Images protégées trouvées: ${protectedImages.length}`);
    
    if (blurOnDevTools) {
      protectedImages.forEach((img) => {
        console.log('Blur appliqué sur:', img);
        (img as HTMLElement).style.filter = 'blur(20px)';
        (img as HTMLElement).style.transition = 'filter 0.3s ease';
      });
    }

    if (trackSuspiciousActivity) {
      logProtectionEvent('devtools_open', { action: 'blur_applied' });
    }
  };

  const handleDevToolsClose = () => {
    console.log('✅ DevTools fermé - Retrait du blur');
    
    document.querySelectorAll('img[data-protected="true"]').forEach((img) => {
      (img as HTMLElement).style.filter = '';
    });
  };

  const preventScreenshot = useCallback(() => {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        logProtectionEvent('screenshot_attempt', { method: 'printscreen' });
        console.warn('🚫 Tentative de screenshot détectée (PrintScreen)');
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        logProtectionEvent('screenshot_attempt', { 
          method: 'keyboard_shortcut',
          keys: `${e.metaKey ? 'Cmd' : 'Ctrl'}+Shift+${e.key}`
        });
        console.warn('🚫 Tentative de screenshot détectée (raccourci clavier)');
      }
    });

    let hideTimeout: NodeJS.Timeout;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen') {
        document.querySelectorAll('img[data-protected="true"]').forEach((img) => {
          (img as HTMLElement).style.opacity = '0';
        });
        
        hideTimeout = setTimeout(() => {
          document.querySelectorAll('img[data-protected="true"]').forEach((img) => {
            (img as HTMLElement).style.opacity = '1';
          });
        }, 300);
      }
    });

    return () => clearTimeout(hideTimeout);
  }, []);

  const logProtectionEvent = async (
    eventType: string, 
    details: Record<string, any> = {}
  ) => {
    try {
      const sessionId = sessionStorage.getItem('analytics_session_id');
      
      await supabase.from('protection_logs').insert({
        event_type: eventType,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        details,
        blocked: true,
        timestamp: new Date().toISOString(),
      });

      suspiciousActivityRef.current += 1;

      if (suspiciousActivityRef.current > 3) {
        console.warn('⚠️ Activité suspecte détectée! Application du blur permanent');
        document.querySelectorAll('img[data-protected="true"]').forEach((img) => {
          (img as HTMLElement).style.filter = 'blur(30px) grayscale(100%)';
        });
      }
    } catch (error) {
      console.error('❌ Erreur log protection:', error);
    }
  };

  const applyInvisibleWatermark = (imageElement: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const watermarkData = `©${new Date().getTime()}`;
    
    let bitIndex = 0;
    for (let i = 0; i < watermarkData.length && bitIndex < imageData.data.length * 8; i++) {
      const charCode = watermarkData.charCodeAt(i);
      for (let bit = 0; bit < 8; bit++) {
        const pixelIndex = Math.floor(bitIndex / 8) * 4;
        const channelIndex = pixelIndex + (bitIndex % 4);
        
        if (channelIndex < imageData.data.length) {
          const bitValue = (charCode >> bit) & 1;
          imageData.data[channelIndex] = (imageData.data[channelIndex] & 0xFE) | bitValue;
        }
        
        bitIndex++;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL();
  };

  const generateBotTrap = useCallback(async () => {
    if (!botTrapEnabled) return;

    const trapImages = document.querySelectorAll('img[data-real-image]');
    trapImages.forEach(async (img) => {
      const realImageId = img.getAttribute('data-real-image');
      
      const trapUrl = `/api/bot-trap/${realImageId}`;
      
      const trapImage = new Image();
      trapImage.onerror = () => {
        logProtectionEvent('bot_trap_triggered', { 
          imageId: realImageId,
          suspectedBot: true 
        });
      };
    });
  }, [botTrapEnabled]);

  const createBlockchainProof = async (imageId: string, imageUrl: string) => {
    try {
      const timestamp = new Date().toISOString();
      const data = `${imageId}-${imageUrl}-${timestamp}`;
      
      const msgBuffer = new TextEncoder().encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const blockchainHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await supabase.from('image_metadata').upsert({
        image_id: imageId,
        blockchain_hash: blockchainHash,
        watermark_applied: true,
        watermark_type: 'blockchain',
        updated_at: new Date().toISOString(),
      });

      console.log('✅ Blockchain proof créé:', blockchainHash.substring(0, 16) + '...');
      return blockchainHash;
    } catch (error) {
      console.error('❌ Erreur blockchain proof:', error);
      return null;
    }
  };

  const preventScraping = useCallback(() => {
    document.querySelectorAll('img[data-protected="true"]').forEach((img, index) => {
      const randomClass = `img-${Math.random().toString(36).substring(7)}`;
      img.classList.add(randomClass);
    });

    let mouseMovements = 0;
    let lastScrollTime = Date.now();

    document.addEventListener('mousemove', () => {
      mouseMovements++;
    });

    document.addEventListener('scroll', () => {
      const now = Date.now();
      const timeDiff = now - lastScrollTime;
      
      if (timeDiff < 100 && mouseMovements < 5) {
        logProtectionEvent('suspicious_scraping', {
          mouseMovements,
          scrollSpeed: timeDiff,
        });
      }
      
      lastScrollTime = now;
    });
  }, []);

  useEffect(() => {
    if (disableRightClick) {
      const handleContextMenu = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' && target.getAttribute('data-protected') === 'true') {
          e.preventDefault();
          console.warn('🚫 Clic droit bloqué sur image protégée');
          logProtectionEvent('right_click_attempt', { tagName: target.tagName });
        }
      };
      
      document.addEventListener('contextmenu', handleContextMenu);
      return () => document.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [disableRightClick]);

  useEffect(() => {
    if (disableScreenshot) {
      preventScreenshot();
    }

    if (blurOnDevTools) {
      console.log('🔍 Démarrage de la détection DevTools...');
      const interval = setInterval(detectDevTools, 1000);
      return () => clearInterval(interval);
    }
  }, [disableScreenshot, blurOnDevTools, detectDevTools, preventScreenshot]);

  useEffect(() => {
    if (trackSuspiciousActivity) {
      preventScraping();
    }
  }, [trackSuspiciousActivity, preventScraping]);

  useEffect(() => {
    generateBotTrap();
  }, [generateBotTrap]);

  useEffect(() => {
    setTimeout(() => {
      const protectedImages = document.querySelectorAll('img[data-protected="true"]');
      console.log(`🛡️ Protection activée sur ${protectedImages.length} images`);
      
      if (protectedImages.length === 0) {
        console.warn('⚠️ ATTENTION: Aucune image avec data-protected="true" trouvée!');
      }
    }, 1000);
  }, []);

  return {
    logProtectionEvent,
    applyInvisibleWatermark,
    createBlockchainProof,
    suspiciousActivityCount: suspiciousActivityRef.current,
  };
};