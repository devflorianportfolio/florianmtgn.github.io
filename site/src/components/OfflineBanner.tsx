import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OfflineBanner = ({ isOnline, updateAvailable, onUpdate }: any) => {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">Mode hors ligne</p>
                <p className="text-xs opacity-90">
                  Les contenus en cache sont disponibles
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {updateAvailable && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white p-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">Mise à jour disponible</p>
                <p className="text-xs opacity-90">
                  Une nouvelle version est prête à être installée
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onUpdate}
              className="bg-white text-blue-500 hover:bg-white/90"
            >
              Mettre à jour
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};