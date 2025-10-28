import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Détecter changements de connexion
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: '🟢 En ligne',
        description: 'Connexion rétablie',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '🔴 Hors ligne',
        description: 'Mode consultation activé',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    // Enregistrer le Service Worker uniquement en production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          setSwRegistration(registration);

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  toast({
                    title: '🔄 Mise à jour disponible',
                    description: 'Une nouvelle version est prête',
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erreur Service Worker:', error);
        });
    } else if ('serviceWorker' in navigator) {
      // En développement, enregistrer quand même mais avec avertissemen
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker non chargé en dev:', error.message);
        });
    }
  }, [toast]);

  // Filtre les URLs valides pour le cache (évite chrome-extension://, file://, etc.)
  const filterCacheableUrls = (urls: string[]): string[] => {
    return urls.filter(url => {
      try {
        const urlObj = new URL(url);
        // Accepter uniquement http:// et https://
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    });
  };

  const cacheGalleryImages = (imageUrls: string[]) => {
    if (swRegistration && swRegistration.active) {
      const cacheableUrls = filterCacheableUrls(imageUrls);
      
      if (cacheableUrls.length > 0) {
        swRegistration.active.postMessage({
          type: 'CACHE_GALLERY_IMAGES',
          urls: cacheableUrls,
        });
      }
    }
  };

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      // Vérifier la connexion avant de recharger
      if (navigator.onLine) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      } else {
        toast({
          title: '📴 Pas de connexion',
          description: 'La mise à jour sera appliquée quand la connexion sera rétablie',
          variant: 'destructive',
        });
      }
    }
  };

  return {
    isOnline,
    updateAvailable,
    updateServiceWorker,
    cacheGalleryImages,
  };
};