import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { Skeleton } from "./ui/skeleton";
import { ImageLightbox } from "./ImageLightbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  alt: string;
  category: string;
  width?: number;
  height?: number;
  fullscreen_zoom?: boolean;
}

const extractDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('rgba(0, 0, 0, 0.3)');
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        // Échantillonner plusieurs points de l'image
        const samples = [
          { x: img.width * 0.25, y: img.height * 0.25 },
          { x: img.width * 0.75, y: img.height * 0.25 },
          { x: img.width * 0.5, y: img.height * 0.5 },
          { x: img.width * 0.25, y: img.height * 0.75 },
          { x: img.width * 0.75, y: img.height * 0.75 },
        ];
        
        let r = 0, g = 0, b = 0;
        
        samples.forEach(sample => {
          const pixel = ctx.getImageData(sample.x, sample.y, 1, 1).data;
          r += pixel[0];
          g += pixel[1];
          b += pixel[2];
        });
        
        r = Math.floor(r / samples.length);
        g = Math.floor(g / samples.length);
        b = Math.floor(b / samples.length);
        
        resolve(`rgba(${r}, ${g}, ${b}, 0.7)`);
      } catch (error) {
        resolve('rgba(0, 0, 0, 0.3)');
      }
    };
    
    img.onerror = () => {
      resolve('rgba(0, 0, 0, 0.3)');
    };
    
    img.src = imageUrl;
  });
};

export const AnimatedGallery = () => {
  const [filter, setFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxOpenTime, setLightboxOpenTime] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [imageColors, setImageColors] = useState<Map<string, string>>(new Map());
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const devToolsCheckRef = useRef<NodeJS.Timeout | null>(null);
  const { data: images, isLoading } = useGalleryImages();
  const { t } = useLanguage();
  const { trackGalleryInteraction, trackClick, trackSearch } = useAnalytics();

  const categories = [
    "all",
    ...Array.from(new Set(images?.map((img: GalleryImage) => img.category) || []))
  ];

  const filteredImages = filter === "all" 
    ? images 
    : images?.filter((img: GalleryImage) => img.category === filter);

  // Détection DevTools
  const detectDevTools = useCallback(() => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    const isOpen = (heightThreshold && orientation === 'horizontal') || 
                   (widthThreshold && orientation === 'vertical');
    
    setDevToolsOpen(isOpen);
  }, []);

  // Vérifier DevTools régulièrement
  useEffect(() => {
    detectDevTools();
    devToolsCheckRef.current = setInterval(detectDevTools, 1000);
    
    return () => {
      if (devToolsCheckRef.current) {
        clearInterval(devToolsCheckRef.current);
      }
    };
  }, [detectDevTools]);

  // Précharger les images et extraire les couleurs
  useEffect(() => {
    if (!filteredImages) return;
    
    const priorityImages = filteredImages.slice(0, 8);
    priorityImages.forEach(async (image: GalleryImage) => {
      const img = new Image();
      img.src = image.image_url;
      img.onload = () => handleImageLoad(image.id);
      
      // Extraire la couleur dominante
      if (!imageColors.has(image.id)) {
        const color = await extractDominantColor(image.image_url);
        setImageColors(prev => new Map(prev).set(image.id, color));
      }
    });
  }, [filter, filteredImages]);

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-full h-64 mb-2" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const handleCategoryChange = (category: string) => {
    setFilter(category);
    trackClick('gallery_filter', category, `Filter: ${category}`);
    
    if (category !== 'all') {
      const resultsCount = images?.filter((img: GalleryImage) => img.category === category).length || 0;
      trackSearch(category, resultsCount);
    }
  };

  const handleImageClick = (index: number) => {
    // Bloquer l'ouverture si DevTools est ouvert
    if (devToolsOpen) {
      return;
    }
    
    const image = filteredImages[index];
    setSelectedIndex(index);
    setLightboxOpenTime(Date.now());
    
    trackGalleryInteraction(image.id, 'click');
    trackGalleryInteraction(image.id, 'lightbox_open');
  };

  const handleLightboxClose = () => {
    if (selectedIndex !== null && lightboxOpenTime > 0) {
      const durationSeconds = Math.round((Date.now() - lightboxOpenTime) / 1000);
      const image = filteredImages[selectedIndex];
      trackGalleryInteraction(image.id, 'view', durationSeconds);
    }
    
    setSelectedIndex(null);
    setLightboxOpenTime(0);
  };

  const trackImageTransition = (currentIndex: number) => {
    if (lightboxOpenTime > 0) {
      const durationSeconds = Math.round((Date.now() - lightboxOpenTime) / 1000);
      const currentImage = filteredImages[currentIndex];
      trackGalleryInteraction(currentImage.id, 'view', durationSeconds);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && filteredImages && selectedIndex < filteredImages.length - 1) {
      trackImageTransition(selectedIndex);
      
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setLightboxOpenTime(Date.now());
      
      const nextImage = filteredImages[nextIndex];
      trackGalleryInteraction(nextImage.id, 'lightbox_open');
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      trackImageTransition(selectedIndex);
      
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setLightboxOpenTime(Date.now());
      
      const prevImage = filteredImages[prevIndex];
      trackGalleryInteraction(prevImage.id, 'lightbox_open');
    }
  };

  return (
    <>
      {/* Alerte DevTools */}
      {devToolsOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-600 font-bold">
              Outils de développement détectés
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400">
              Pour des raisons de sécurité, veuillez fermer les outils de développement pour accéder aux images en plein écran.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.section 
        id="work"
        className="py-16 md:py-24 px-2 md:px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-8 text-center"
          >
            {t('nav.work')}
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleCategoryChange(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                }`}
              >
                {category === 'all' ? t('gallery.all') : category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          <style>{`
            .gallery-container {
              columns: 2;
              column-gap: 2px;
            }
            @media (min-width: 768px) {
              .gallery-container {
                columns: 3;
              }
            }
            @media (min-width: 1024px) {
              .gallery-container {
                columns: 4;
              }
            }
            .gallery-item {
              break-inside: avoid;
              margin-bottom: 2px;
            }
            .gallery-image {
              width: 100%;
              height: auto;
              display: block;
            }
          `}</style>
          
          <div className="gallery-container">
            {filteredImages?.map((image: GalleryImage, index: number) => {
              const isLoaded = loadedImages.has(image.id);
              const dominantColor = imageColors.get(image.id) || 'rgba(0, 0, 0, 0.3)';
              
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  onClick={() => handleImageClick(index)}
                  className={`gallery-item relative overflow-hidden rounded-md group ${
                    devToolsOpen ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    aspectRatio: image.width && image.height 
                      ? `${image.width} / ${image.height}` 
                      : 'auto'
                  }}
                >
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  
                  <motion.img
                    src={image.image_url}
                    alt={image.alt}
                    data-protected="true"
                    data-real-image={image.id}
                    className="gallery-image w-full h-full object-cover transition-opacity duration-500"
                    loading="lazy"
                    decoding="async"
                    onLoad={() => handleImageLoad(image.id)}
                    style={{ 
                      opacity: isLoaded ? 1 : 0 
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${dominantColor} 0%, transparent 50%)`
                    }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <p className="text-white font-medium text-sm md:text-base mb-1">
                        {image.alt}
                      </p>
                      <p className="text-white/70 text-xs md:text-sm tracking-wide uppercase">
                        {image.category}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {selectedIndex !== null && filteredImages && (
        <ImageLightbox
          images={filteredImages.map((image: GalleryImage) => ({
            image: image.image_url,
            alt: image.alt,
            category: image.category,
            width: image.width,
            height: image.height,
            fullscreen_zoom: image.fullscreen_zoom,
          }))}
          currentIndex={selectedIndex}
          onClose={handleLightboxClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </>
  );
};