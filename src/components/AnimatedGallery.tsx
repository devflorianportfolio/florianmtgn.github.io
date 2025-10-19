import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { Skeleton } from "./ui/skeleton";
import { ImageLightbox } from "./ImageLightbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";

interface GalleryImage {
  id: string;
  image_url: string;
  alt: string;
  category: string;
  width?: number;
  height?: number;
  fullscreen_zoom?: boolean;
}

export const AnimatedGallery = () => {
  const [filter, setFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxOpenTime, setLightboxOpenTime] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
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

  // Précharger les images prioritaires du filtre actuel
  useEffect(() => {
    if (!filteredImages) return;
    
    const priorityImages = filteredImages.slice(0, 8);
    priorityImages.forEach((image: GalleryImage) => {
      const img = new Image();
      img.src = image.image_url;
      img.onload = () => handleImageLoad(image.id);
    });
  }, [filter, filteredImages]);

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto">
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
              
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  onClick={() => handleImageClick(index)}
                  className="gallery-item relative overflow-hidden rounded-md cursor-pointer group"
                  style={{
                    aspectRatio: image.width && image.height 
                      ? `${image.width} / ${image.height}` 
                      : 'auto'
                  }}
                >
                  {/* Placeholder pendant le chargement */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  
                  <motion.img
                    src={image.image_url}
                    alt={image.alt}
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
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <p className="text-white font-medium text-xs md:text-sm tracking-wide uppercase">
                        {image.category}
                      </p>
                      {image.width && image.height && (
                        <p className="text-white/70 text-xs mt-1">
                          {image.width} × {image.height}px
                        </p>
                      )}
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