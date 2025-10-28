import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminAccessProvider } from "@/contexts/AdminAccessContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { RightClickProtection } from "@/components/RightClickProtection";
import { OfflineManager } from '@/components/OfflineManager';
import { ServiceWorkerDebugger } from '@/components/ServiceWorkerDebugger';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useImageProtection } from '@/hooks/useImageProtection';
import { setupRefreshProtection, getCacheStats } from '@/utils/cacheSafety';
import { supabase } from '@/integrations/supabase/client';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Legal from "./pages/Legal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { 
    isOnline, 
    updateAvailable, 
    updateServiceWorker, 
    cacheGalleryImages 
  } = useServiceWorker();
  
  const { 
    createBlockchainProof,
    applyInvisibleWatermark 
  } = useImageProtection({
    disableRightClick: true,
    disableScreenshot: true,
    blurOnDevTools: true,
    trackSuspiciousActivity: true,
    botTrapEnabled: true,
  });

  useEffect(() => {
    setupRefreshProtection();
    getCacheStats().then(stats => {
      if (stats) {
        console.log('📦 Statistiques du cache:');
        console.log(`   • Nombre de caches: ${stats.totalCaches}`);
        console.log(`   • Entrées totales: ${stats.totalEntries}`);
        console.log(`   • Taille estimée: ${stats.estimatedSize}`);
        stats.cacheNames.forEach(name => console.log(`   • ${name}`));
      }
    });
    const handleOnline = () => {
      console.log('✅ Connexion rétablie - Revalidation possible');
    };

    const handleOffline = () => {
      console.log('⚠️ Connexion perdue - Mode cache activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  useEffect(() => {
    const cacheGalleryImagesOnLoad = async () => {
      if (!navigator.onLine) {
        console.log('📴 Hors ligne - Skip du cache initial');
        return;
      }

      try {
        const { data: images } = await supabase
          .from('gallery_images')
          .select('image_url, id')
          .limit(50);
        
        if (images && images.length > 0) {
          const imageUrls = images.map(img => img.image_url);
          cacheGalleryImages(imageUrls);
          images.forEach(async (image) => {
            try {
              const { data: metadata } = await supabase
                .from('image_metadata')
                .select('blockchain_hash')
                .eq('image_id', image.id)
                .maybeSingle();
              
              if (!metadata?.blockchain_hash) {
                await createBlockchainProof(image.id, image.image_url);
              }
            } catch (error) {
              console.warn(`Erreur blockchain pour image ${image.id}:`, error);
            }
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors du cache des images:', error);
      }
    };
    const timer = setTimeout(() => {
      cacheGalleryImagesOnLoad();
    }, 2000);

    return () => clearTimeout(timer);
  }, [cacheGalleryImages, createBlockchainProof]);

  useEffect(() => {
    const applyGlobalSEO = async () => {
      try {
        const { data: config } = await supabase
          .from('site_config')
          .select('site_name, site_description, meta_title, meta_keywords')
          .single();

        if (config) {
          if (config.meta_title) {
            document.title = config.meta_title;
          }
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
          }
          metaDescription.setAttribute('content', config.site_description || '');
          if (config.meta_keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
              metaKeywords = document.createElement('meta');
              metaKeywords.setAttribute('name', 'keywords');
              document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', config.meta_keywords);
          }
        }
      } catch (error) {
        console.error('❌ Erreur application SEO global:', error);
      }
    };

    applyGlobalSEO();
  }, []);

  return (
    <>
      {/* Gestionnaire de cache et mode hors-ligne (remplace OfflineBanner) */}
      <OfflineManager />
      {/* Toast notifications */}
      <Toaster />
      <Sonner />
      {/* Protections */}
      <RightClickProtection />
      {/* Routes */}
      <BrowserRouter>
        <MaintenanceGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </MaintenanceGuard>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AdminAccessProvider>
        <ThemeProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </AdminAccessProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;