import { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";

interface ImageLightboxProps {
  images: Array<{ 
    image: string; 
    alt: string; 
    category: string;
    width?: number;
    height?: number;
    fullscreen_zoom?: boolean;
  }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

// Fonction pour extraire la couleur dominante
const extractDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('rgba(0, 0, 0, 0.8)');
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
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
        
        resolve(`rgba(${r}, ${g}, ${b}, 0.95)`);
      } catch (error) {
        resolve('rgba(0, 0, 0, 0.8)');
      }
    };
    
    img.onerror = () => {
      resolve('rgba(0, 0, 0, 0.8)');
    };
    
    img.src = imageUrl;
  });
};

export const ImageLightbox = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.95)');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const minSwipeDistance = 50;
  const currentImage = images[currentIndex];
  const shouldZoomFullscreen = currentImage?.fullscreen_zoom || false;

  // Extraire la couleur de fond pour chaque image
  useEffect(() => {
    if (currentImage?.image) {
      extractDominantColor(currentImage.image).then(color => {
        setBackgroundColor(color);
      });
    }
  }, [currentImage]);

  // Reset zoom quand on change d'image
  useEffect(() => {
    setIsZoomed(false);
    setScrollPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [currentIndex]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
      if (e.key === "ArrowLeft" && !isZoomed) onPrev();
      if (e.key === "ArrowRight" && !isZoomed) onNext();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose, onNext, onPrev, isFullscreen, isZoomed]);

  // Détection changement fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide des contrôles
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isZoomed) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [currentIndex, isZoomed]);

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error entering fullscreen:", err);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Gestion tactile (swipe)
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (isZoomed) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - scrollPosition.x,
          y: e.touches[0].clientY - scrollPosition.y
        });
      } else {
        setTouchEnd(null);
        setTouchStart(e.touches[0].clientX);
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (isZoomed && isDragging) {
        const newX = e.touches[0].clientX - dragStart.x;
        const newY = e.touches[0].clientY - dragStart.y;
        setScrollPosition({ x: newX, y: newY });
      } else if (!isZoomed) {
        setTouchEnd(e.touches[0].clientX);
      }
    }
  };

  const onTouchEnd = () => {
    if (isZoomed) {
      setIsDragging(false);
    } else if (touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe && currentIndex < images.length - 1) {
        onNext();
      }
      if (isRightSwipe && currentIndex > 0) {
        onPrev();
      }
    }
  };

  // Gestion souris (drag)
  const onMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - scrollPosition.x,
        y: e.clientY - scrollPosition.y
      });
      e.preventDefault();
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isZoomed && isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setScrollPosition({ x: newX, y: newY });
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  // Double-clic/tap pour zoomer
  const lastTapRef = useRef(0);
  const handleImageClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) return;
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      setIsZoomed(!isZoomed);
      setScrollPosition({ x: 0, y: 0 });
      resetControlsTimeout();
    }
    
    lastTapRef.current = now;
  };

  // Style de l'image selon le mode
  const getImageStyle = () => {
    if (isZoomed) {
      return 'w-auto h-auto max-w-none cursor-grab active:cursor-grabbing';
    } else if (shouldZoomFullscreen && isFullscreen) {
      return 'w-full h-full object-cover cursor-zoom-in';
    } else if (shouldZoomFullscreen && !isFullscreen) {
      return 'w-full h-full md:w-auto md:h-full md:max-w-full object-cover md:object-contain cursor-zoom-in';
    } else {
      return 'max-w-full max-h-full object-contain cursor-zoom-in';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] transition-colors duration-500"
      style={{ backgroundColor }}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      {/* Header avec contrôles */}
      <div 
        className={`absolute top-0 left-0 right-0 p-3 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-xs md:text-sm text-white font-medium drop-shadow-lg">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleFullscreen}
            className="hidden md:block p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            aria-label={isFullscreen ? "Quitter plein écran" : "Plein écran"}
            title={isFullscreen ? "Quitter plein écran (F)" : "Plein écran (F)"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Maximize className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            aria-label="Fermer"
            title="Fermer (Esc)"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Boutons précédent/suivant */}
      {!isZoomed && (
        <>
          <button
            onClick={onPrev}
            className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white/20 rounded-full transition-all z-20 disabled:opacity-0 disabled:pointer-events-none text-white bg-black/40 backdrop-blur-sm ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            disabled={currentIndex === 0}
            aria-label="Image précédente"
            title="Précédent (←)"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={onNext}
            className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white/20 rounded-full transition-all z-20 disabled:opacity-0 disabled:pointer-events-none text-white bg-black/40 backdrop-blur-sm ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            disabled={currentIndex === images.length - 1}
            aria-label="Image suivante"
            title="Suivant (→)"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Container de l'image */}
      <div 
        ref={imageContainerRef}
        className={`absolute inset-0 flex items-center justify-center touch-none ${
          isZoomed ? 'overflow-hidden' : 'overflow-hidden'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClick={handleImageClick}
      >
        <img
          key={currentIndex}
          src={currentImage.image}
          alt={currentImage.alt}
          className={`select-none transition-transform duration-200 ${
            !isZoomed ? 'animate-scale-in' : ''
          } ${getImageStyle()}`}
          style={isZoomed ? {
            transform: `translate(${scrollPosition.x}px, ${scrollPosition.y}px) scale(2)`,
            transformOrigin: 'center center',
            width: currentImage.width ? `${currentImage.width}px` : undefined,
            height: currentImage.height ? `${currentImage.height}px` : undefined,
          } : {
            width: currentImage.width && !shouldZoomFullscreen ? `${currentImage.width}px` : undefined,
            height: currentImage.height && !shouldZoomFullscreen ? `${currentImage.height}px` : undefined,
          }}
          draggable={false}
        />
      </div>

      {/* Info en bas avec dégradé basé sur l'image */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-3 md:p-6 text-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`
        }}
      >
        <p className="text-white font-medium text-sm md:text-base mb-2">
          {currentImage.alt}
        </p>
        <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-white/80">
          <span className="uppercase tracking-wide">{currentImage.category}</span>
          {currentImage.width && currentImage.height && (
            <span>•</span>
          )}
          {currentImage.width && currentImage.height && (
            <span>{currentImage.width} × {currentImage.height}px</span>
          )}
        </div>
        <p className="text-xs text-white/60 mt-2">
          {isZoomed 
            ? 'Double-clic pour dézoomer • Glisser pour déplacer' 
            : 'Double-clic pour zoomer • Glisser pour changer d\'image'}
        </p>
      </div>

      {/* Indicateurs de pagination mobile */}
      {!isZoomed && (
        <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 bg-white' 
                  : 'w-1 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;