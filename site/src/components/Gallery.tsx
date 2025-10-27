import { useState } from "react";
import { motion } from "framer-motion";
import { ImageLightbox } from "./ImageLightbox";

interface GalleryProps {
  images: Array<{ image: string; alt: string; category: string }>;
}

export const Gallery = ({ images }: GalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(images.map((img) => img.category)))];

  const filteredImages =
    filter === "all" ? images : images.filter((img) => img.category === filter);

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <section id="work" className="py-16 md:py-24 px-2 md:px-4">
      <div className="max-w-[1400px] mx-auto px-2">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-16 px-2"
        >
          Mes Travaux
        </motion.h2>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-12 px-2">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(category)}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                filter === category
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-foreground/10"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Masonry Gallery with CSS columns */}
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
        `}</style>
        <div className="gallery-container">
          {filteredImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.03,
              }}
              onClick={() => setSelectedIndex(index)}
              className="gallery-item relative overflow-hidden rounded-md cursor-pointer group"
            >
              <motion.img
                src={image.image}
                alt={image.alt}
                className="w-full h-auto object-cover"
                loading="lazy"
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
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <ImageLightbox
          images={filteredImages}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </section>
  );
};

export default Gallery;