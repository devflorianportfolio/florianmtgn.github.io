// src/hooks/useAnalytics.ts
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Générer ou récupérer un session ID unique
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Générer ou récupérer un visitor ID unique (persiste entre sessions)
const getVisitorId = () => {
  let visitorId = localStorage.getItem('analytics_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('analytics_visitor_id', visitorId);
  }
  return visitorId;
};

// Détecter le type d'appareil
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Obtenir le navigateur
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown';
};

// Obtenir l'OS
const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
};

// Obtenir la résolution d'écran
const getScreenResolution = (): string => {
  return `${window.screen.width}x${window.screen.height}`;
};

// Obtenir la langue
const getLanguage = (): string => {
  return navigator.language || 'unknown';
};

// Obtenir les informations de localisation (via API externe ou approximation)
const getLocationData = async () => {
  try {
    // Utiliser une API de géolocalisation IP (exemple avec ipapi.co)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'unknown',
      city: data.city || 'unknown',
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      country: 'unknown',
      city: 'unknown',
    };
  }
};

// Obtenir le type de connexion
const getConnectionType = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType || 'unknown';
};

// Extraire les paramètres UTM
const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
  };
};

export const useAnalytics = () => {
  const sessionId = getSessionId();
  const visitorId = getVisitorId();

  // Tracker une vue de page avec toutes les informations
  const trackPageView = async (pageName: string) => {
    try {
      const locationData = await getLocationData();
      
      await supabase.from('page_analytics').insert({
        session_id: sessionId,
        page_name: pageName,
        page_url: window.location.href,
        referrer: document.referrer || null,
        country: locationData.country,
        city: locationData.city,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        screen_resolution: getScreenResolution(),
        language: getLanguage(),
        timestamp: new Date().toISOString(),
      });

      // Mettre à jour ou créer la session visiteur
      await updateVisitorSession();
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  // Mettre à jour la session visiteur
  const updateVisitorSession = async () => {
    try {
      const { data: existingSession } = await supabase
        .from('visitor_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      const utmParams = getUTMParams();

      if (existingSession) {
        await supabase
          .from('visitor_sessions')
          .update({
            last_visit: new Date().toISOString(),
            page_count: (existingSession.page_count || 0) + 1,
          })
          .eq('session_id', sessionId);
      } else {
        // Vérifier si c'est un visiteur qui revient
        const { data: previousSessions } = await supabase
          .from('visitor_sessions')
          .select('*')
          .eq('visitor_id', visitorId)
          .limit(1);

        await supabase.from('visitor_sessions').insert({
          session_id: sessionId,
          visitor_id: visitorId,
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString(),
          page_count: 1,
          is_returning: previousSessions && previousSessions.length > 0,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
        });
      }
    } catch (error) {
      console.error('Error updating visitor session:', error);
    }
  };

  // Tracker un clic avec position
  const trackClick = async (elementType: string, elementId?: string, elementText?: string) => {
    try {
      const pageName = window.location.pathname;

      await supabase.from('click_analytics').insert({
        session_id: sessionId,
        element_id: elementId || null,
        element_text: elementText || null,
        element_type: elementType,
        page_name: pageName,
        click_position: null, // Sera ajouté par l'event listener si nécessaire
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  // Tracker un clic avec position exacte
  const trackClickWithPosition = async (
    event: MouseEvent,
    elementType: string,
    elementId?: string,
    elementText?: string
  ) => {
    try {
      const pageName = window.location.pathname;

      await supabase.from('click_analytics').insert({
        session_id: sessionId,
        element_id: elementId || null,
        element_text: elementText || null,
        element_type: elementType,
        page_name: pageName,
        click_position: { x: event.clientX, y: event.clientY },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking click with position:', error);
    }
  };

  // Tracker une interaction avec une image de galerie
  const trackGalleryInteraction = async (
    imageId: string,
    interactionType: 'view' | 'click' | 'lightbox_open' | 'download',
    durationSeconds?: number,
    category?: string
  ) => {
    try {
      await supabase.from('gallery_interactions').insert({
        session_id: sessionId,
        image_id: imageId,
        interaction_type: interactionType,
        duration_seconds: durationSeconds || null,
        category: category || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking gallery interaction:', error);
    }
  };

  // Tracker une recherche
  const trackSearch = async (query: string, resultsCount: number, clickedResult?: string) => {
    try {
      const pageName = window.location.pathname;

      await supabase.from('search_analytics').insert({
        session_id: sessionId,
        query: query,
        results_count: resultsCount,
        clicked_result: clickedResult || null,
        page_name: pageName,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  // Tracker un événement de conversion
  const trackConversion = async (eventType: string, eventValue?: string) => {
    try {
      const pageName = window.location.pathname;

      await supabase.from('conversion_events').insert({
        session_id: sessionId,
        event_type: eventType,
        event_value: eventValue || null,
        page_name: pageName,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  // Tracker les métriques de performance
  const trackPerformance = useCallback(async (pageName: string) => {
    try {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Attendre les métriques de peinture
        setTimeout(async () => {
          const paintEntries = performance.getEntriesByType('paint');
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          
          // Obtenir LCP via PerformanceObserver
          let lcpValue = null;
          if ('PerformanceObserver' in window) {
            try {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;
                lcpValue = lastEntry?.renderTime || lastEntry?.loadTime;
              });
              observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
              console.warn('LCP observer not supported');
            }
          }

          // Obtenir CLS
          let clsValue = 0;
          if ('PerformanceObserver' in window) {
            try {
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                  }
                }
              });
              observer.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
              console.warn('CLS observer not supported');
            }
          }

          // Obtenir FID
          let fidValue = null;
          if ('PerformanceObserver' in window) {
            try {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                fidValue = entries[0] ? (entries[0] as any).processingStart - entries[0].startTime : null;
              });
              observer.observe({ entryTypes: ['first-input'] });
            } catch (e) {
              console.warn('FID observer not supported');
            }
          }

          await supabase.from('performance_metrics').insert({
            session_id: sessionId,
            page_name: pageName,
            load_time: perfData ? Math.round(perfData.loadEventEnd - perfData.fetchStart) : null,
            dom_ready_time: perfData ? Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart) : null,
            first_paint: fcp ? Math.round(fcp.startTime) : null,
            largest_contentful_paint: lcpValue ? Math.round(lcpValue) : null,
            cumulative_layout_shift: clsValue || null,
            first_input_delay: fidValue ? Math.round(fidValue) : null,
            connection_type: getConnectionType(),
            timestamp: new Date().toISOString(),
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }, [sessionId]);

  // Tracker la profondeur de scroll
  const trackScrollDepth = useCallback(async (pageName: string, maxDepthPercent: number, timeToMaxDepth: number) => {
    try {
      await supabase.from('scroll_depth').insert({
        session_id: sessionId,
        page_name: pageName,
        max_depth_percent: Math.round(maxDepthPercent),
        time_to_max_depth: Math.round(timeToMaxDepth),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking scroll depth:', error);
    }
  }, [sessionId]);

  // Tracker les erreurs JavaScript
  const trackError = useCallback(async (errorMessage: string, errorStack?: string) => {
    try {
      const pageName = window.location.pathname;

      await supabase.from('error_logs').insert({
        session_id: sessionId,
        error_message: errorMessage,
        error_stack: errorStack || null,
        page_name: pageName,
        browser: getBrowser(),
        os: getOS(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking error:', error);
    }
  }, [sessionId]);

  // Auto-tracker les erreurs globales
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(event.message, event.error?.stack);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(`Unhandled Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    trackPageView,
    trackClick,
    trackClickWithPosition,
    trackGalleryInteraction,
    trackSearch,
    trackConversion,
    trackPerformance,
    trackScrollDepth,
    trackError,
  };
};

// Hook pour tracker automatiquement les vues de page
export const usePageTracking = (pageName: string) => {
  const { trackPageView, trackPerformance, trackScrollDepth } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
    trackPerformance(pageName);

    // Tracker le scroll depth
    let maxScroll = 0;
    const startTime = Date.now();
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      // Debounce: envoyer après 3 secondes d'inactivité
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const timeElapsed = (Date.now() - startTime) / 1000;
        trackScrollDepth(pageName, maxScroll, timeElapsed);
      }, 3000);
    };

    window.addEventListener('scroll', handleScroll);

    // Envoyer aussi au démontage du composant
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (maxScroll > 0) {
        const timeElapsed = (Date.now() - startTime) / 1000;
        trackScrollDepth(pageName, maxScroll, timeElapsed);
      }
    };
  }, [pageName, trackPageView, trackPerformance, trackScrollDepth]);
};

// Hook pour tracker automatiquement les clics sur un élément
export const useClickTracking = (elementType: string, elementId?: string, elementText?: string) => {
  const { trackClick } = useAnalytics();

  const handleClick = useCallback(() => {
    trackClick(elementType, elementId, elementText);
  }, [elementType, elementId, elementText, trackClick]);

  return handleClick;
};