import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Columns, Layout, Film, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface LayoutConfig {
  id: string;
  name: string;
  type: 'grid' | 'masonry' | 'justified' | 'cinematic';
  config: {
    columns?: number;
    gap?: number;
    aspectRatio?: string;
    rowHeight?: number;
    transition?: string;
    duration?: number;
  };
}

interface GalleryLayoutSelectorProps {
  onLayoutChange: (layout: LayoutConfig) => void;
  allowUserSelection?: boolean;
}

export const GalleryLayoutSelector = ({ 
  onLayoutChange, 
  allowUserSelection = false 
}: GalleryLayoutSelectorProps) => {
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>('');
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_layouts')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      const parsedLayouts = (data || []).map(layout => ({
        ...layout,
        config: typeof layout.config === 'string' 
          ? JSON.parse(layout.config) 
          : layout.config
      }));

      setLayouts(parsedLayouts);
      
      const defaultLayout = parsedLayouts.find(l => l.is_default) || parsedLayouts[0];
      if (defaultLayout) {
        setSelectedLayout(defaultLayout.id);
        onLayoutChange(defaultLayout);
      }
    } catch (error) {
      console.error('Erreur chargement layouts:', error);
    }
  };

  const handleLayoutChange = (layout: LayoutConfig) => {
    setSelectedLayout(layout.id);
    onLayoutChange(layout);
    setShowSelector(false);

    if (allowUserSelection) {
      localStorage.setItem('preferred_gallery_layout', layout.id);
    }
  };

  const getLayoutIcon = (type: string) => {
    switch (type) {
      case 'grid': return Grid3x3;
      case 'masonry': return Columns;
      case 'justified': return Layout;
      case 'cinematic': return Film;
      default: return Grid3x3;
    }
  };

  if (!allowUserSelection) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSelector(!showSelector)}
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Vue
      </Button>

      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 right-0 z-50 bg-card border border-border rounded-lg shadow-xl p-2 min-w-[200px]"
          >
            {layouts.map((layout) => {
              const Icon = getLayoutIcon(layout.type);
              return (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${selectedLayout === layout.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{layout.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GridLayout = ({ images, config, onImageClick }: any) => {
  const { columns = 3, gap = 16, aspectRatio = '1:1' } = config;

  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {images.map((image: any, index: number) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onImageClick(index)}
          className="relative overflow-hidden rounded-lg cursor-pointer group"
          style={{ aspectRatio }}
        >
          <img
            src={image.image_url}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="font-medium text-sm">{image.alt}</p>
              <p className="text-xs text-white/70">{image.category}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const MasonryLayout = ({ images, config, onImageClick }: any) => {
  const { columns = 4, gap = 8 } = config;

  return (
    <div 
      className="masonry-layout"
      style={{
        columnCount: columns,
        columnGap: `${gap}px`,
      }}
    >
      {images.map((image: any, index: number) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onImageClick(index)}
          className="relative mb-2 break-inside-avoid overflow-hidden rounded-lg cursor-pointer group"
        >
          <img
            src={image.image_url}
            alt={image.alt}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="font-medium text-sm mb-1">{image.alt}</p>
              <p className="text-xs text-white/80">{image.category}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const JustifiedLayout = ({ images, config, onImageClick }: any) => {
  const { rowHeight = 300, gap = 4 } = config;

  return (
    <div className="flex flex-wrap" style={{ gap: `${gap}px` }}>
      {images.map((image: any, index: number) => {
        const aspectRatio = image.width && image.height 
          ? image.width / image.height 
          : 1.5;
        
        const width = rowHeight * aspectRatio;

        return (
          <motion.div
            key={image.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onImageClick(index)}
            className="relative overflow-hidden rounded-lg cursor-pointer group flex-shrink-0"
            style={{
              height: `${rowHeight}px`,
              width: `${width}px`,
            }}
          >
            <img
              src={image.image_url}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3">
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium">{image.alt}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export const CinematicLayout = ({ images, config, onImageClick }: any) => {
  const { transition = 'fade', duration = 800 } = config;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
    },
    zoom: {
      initial: { scale: 1.2, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    },
  };

  const currentVariant = variants[transition as keyof typeof variants] || variants.fade;

  return (
    <div className="relative w-full h-[70vh] bg-black rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={currentVariant.initial}
          animate={currentVariant.animate}
          exit={currentVariant.exit}
          transition={{ duration: duration / 1000 }}
          className="absolute inset-0"
          onClick={() => onImageClick(currentIndex)}
        >
          <img
            src={images[currentIndex].image_url}
            alt={images[currentIndex].alt}
            className="w-full h-full object-contain"
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-white text-2xl font-bold mb-2">
              {images[currentIndex].alt}
            </h3>
            <p className="text-white/80 text-sm">
              {images[currentIndex].category}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-2 h-2 rounded-full transition-all
              ${currentIndex === index 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/80'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export const DynamicGallery = ({ images, onImageClick }: any) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutConfig | null>(null);

  const renderLayout = () => {
    if (!currentLayout || !images) return null;

    const layoutProps = {
      images,
      config: currentLayout.config,
      onImageClick,
    };

    switch (currentLayout.type) {
      case 'grid':
        return <GridLayout {...layoutProps} />;
      case 'masonry':
        return <MasonryLayout {...layoutProps} />;
      case 'justified':
        return <JustifiedLayout {...layoutProps} />;
      case 'cinematic':
        return <CinematicLayout {...layoutProps} />;
      default:
        return <GridLayout {...layoutProps} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Galerie</h2>
        <GalleryLayoutSelector 
          onLayoutChange={setCurrentLayout}
          allowUserSelection={true}
        />
      </div>

      {renderLayout()}
    </div>
  );
};