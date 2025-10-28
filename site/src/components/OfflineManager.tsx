import { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useAdminAccess } from '@/contexts/AdminAccessContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';

export const OfflineManager = () => {
  const { isOnline, updateAvailable, updateServiceWorker } = useServiceWorker();
  const { hasAccess } = useAdminAccess();
  const [cacheSize, setCacheSize] = useState<string>('0 MB');
  const [showOfflineBar, setShowOfflineBar] = useState(false);

  useEffect(() => {
    // Afficher la barre hors ligne après 2 secondes
    if (!isOnline) {
      const timer = setTimeout(() => setShowOfflineBar(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowOfflineBar(false);
    }
  }, [isOnline]);

  useEffect(() => {
    // Estimer la taille du cache
    const estimateCacheSize = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usageInMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
          setCacheSize(`${usageInMB} MB`);
        } catch (error) {
          console.error('Erreur estimation cache:', error);
        }
      }
    };

    estimateCacheSize();
    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(estimateCacheSize, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSafeRefresh = () => {
    if (isOnline) {
      window.location.reload();
    } else {
      alert('⚠️ Impossible de rafraîchir en mode hors ligne. La page utilise le cache local.');
    }
  };

  const handleClearCache = async () => {
    if (!isOnline) {
      const confirm = window.confirm(
        '⚠️ Vous êtes hors ligne. Vider le cache supprimera tout le contenu disponible hors ligne. Continuer ?'
      );
      if (!confirm) return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      window.location.reload();
    } catch (error) {
      console.error('Erreur vidage cache:', error);
      alert('❌ Erreur lors du vidage du cache');
    }
  };

  return (
    <>
      {/* Barre de statut hors ligne */}
      {showOfflineBar && (
        <div className="fixed top-20 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Mode hors ligne</span>
            <span className="text-sm opacity-90">
              - Contenu en cache disponible
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOfflineBar(false)}
            className="text-white hover:bg-orange-600"
          >
            Masquer
          </Button>
        </div>
      )}

      {/* Notification de mise à jour */}
      {updateAvailable && (
        <Alert className="fixed bottom-4 right-4 max-w-md z-50 border-blue-500 bg-blue-50">
          <RefreshCw className="h-4 w-4" />
          <AlertTitle>Mise à jour disponible</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Une nouvelle version est prête à être installée.
              {!isOnline && ' (Nécessite une connexion)'}
            </p>
            <Button 
              onClick={updateServiceWorker}
              disabled={!isOnline}
              size="sm"
              className="w-full"
            >
              {isOnline ? 'Mettre à jour maintenant' : 'Attente de connexion...'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Indicateur de statut dans la barre de navigation (admin uniquement) */}
      {hasAccess && (
        <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
            ${isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'}
          `}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Hors ligne</span>
              </>
            )}
          </div>

          {/* Bouton infos cache */}
          <button
            onClick={() => {
              const message = `
📦 Informations du cache:
• Taille utilisée: ${cacheSize}
• Statut: ${isOnline ? 'En ligne' : 'Hors ligne'}
• Service Worker: ${navigator.serviceWorker?.controller ? 'Actif' : 'Inactif'}

Actions disponibles:
• Rafraîchir: ${isOnline ? 'OK' : 'Nécessite connexion'}
• Vider le cache: Disponible
              `.trim();
              
              const action = window.confirm(message + '\n\nVoulez-vous vider le cache ?');
              if (action) handleClearCache();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
          >
            <Database className="w-3 h-3" />
            <span>{cacheSize}</span>
          </button>

          {/* Bouton refresh sécurisé */}
          <button
            onClick={handleSafeRefresh}
            disabled={!isOnline}
            className={`
              p-1.5 rounded-full transition-colors
              ${isOnline 
                ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
            title={isOnline ? 'Rafraîchir la page' : 'Rafraîchissement désactivé hors ligne'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};