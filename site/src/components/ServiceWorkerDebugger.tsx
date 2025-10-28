import { useEffect, useState } from 'react';
import { Bug, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SWDebugInfo {
  supported: boolean;
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
  scope: string;
  scriptURL: string;
  state: string;
  caches: string[];
  cacheEntries: number;
  estimatedSize: string;
  errors: string[];
}

export const ServiceWorkerDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<SWDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const info: SWDebugInfo = {
        supported: 'serviceWorker' in navigator,
        registered: false,
        active: false,
        waiting: false,
        installing: false,
        scope: '',
        scriptURL: '',
        state: 'none',
        caches: [],
        cacheEntries: 0,
        estimatedSize: '0 MB',
        errors: [],
      };

      // Vérifier le Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          
          if (registration) {
            info.registered = true;
            info.scope = registration.scope;
            
            if (registration.active) {
              info.active = true;
              info.scriptURL = registration.active.scriptURL;
              info.state = registration.active.state;
            }
            
            if (registration.waiting) {
              info.waiting = true;
            }
            
            if (registration.installing) {
              info.installing = true;
            }
          }
        } catch (error) {
          info.errors.push(`SW Registration: ${error.message}`);
        }
      }

      // Vérifier les caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          info.caches = cacheNames;
          
          let totalEntries = 0;
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            totalEntries += keys.length;
          }
          info.cacheEntries = totalEntries;
        } catch (error) {
          info.errors.push(`Cache: ${error.message}`);
        }
      }

      // Estimer la taille
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usageInMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
          info.estimatedSize = `${usageInMB} MB`;
        } catch (error) {
          info.errors.push(`Storage Estimate: ${error.message}`);
        }
      }

      setDebugInfo(info);
    } catch (error) {
      console.error('Erreur debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDebugInfo();
    }
  }, [isOpen]);

  const handleUnregister = async () => {
    if (!confirm('Désinscrire le Service Worker ? Cela nécessitera un refresh.')) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      alert('✅ Service Worker désinscrit. La page va se recharger.');
      window.location.reload();
    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleClearCaches = async () => {
    if (!confirm('Vider tous les caches ? Cette action est irréversible.')) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      alert('✅ Caches vidés avec succès.');
      fetchDebugInfo();
    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
        title="Ouvrir le debugger Service Worker"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 w-96 bg-white border-2 border-purple-600 rounded-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          <h3 className="font-semibold">SW Debugger</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDebugInfo}
            disabled={loading}
            className="p-1 hover:bg-purple-700 rounded"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-purple-700 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {!debugInfo ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : (
          <div className="space-y-4 text-sm">
            {/* Status */}
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Status</h4>
              
              <div className="flex items-center gap-2">
                {debugInfo.supported ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span>Service Worker Supporté</span>
              </div>

              <div className="flex items-center gap-2">
                {debugInfo.registered ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span>Enregistré</span>
              </div>

              <div className="flex items-center gap-2">
                {debugInfo.active ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-orange-600" />
                )}
                <span>Actif</span>
              </div>

              {debugInfo.waiting && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span>Mise à jour en attente</span>
                </div>
              )}

              {debugInfo.installing && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span>Installation en cours</span>
                </div>
              )}
            </div>

            {/* Details */}
            {debugInfo.registered && (
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">Détails</h4>
                <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                  <div><strong>State:</strong> {debugInfo.state}</div>
                  <div><strong>Scope:</strong> {debugInfo.scope}</div>
                  <div className="break-all">
                    <strong>Script:</strong> {debugInfo.scriptURL}
                  </div>
                </div>
              </div>
            )}

            {/* Cache */}
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Cache</h4>
              <div className="space-y-1">
                <div>Caches: <strong>{debugInfo.caches.length}</strong></div>
                <div>Entrées: <strong>{debugInfo.cacheEntries}</strong></div>
                <div>Taille: <strong>{debugInfo.estimatedSize}</strong></div>
              </div>

              {debugInfo.caches.length > 0 && (
                <div className="text-xs bg-gray-50 p-2 rounded space-y-1">
                  {debugInfo.caches.map(cacheName => (
                    <div key={cacheName}>• {cacheName}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Errors */}
            {debugInfo.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Erreurs</h4>
                <div className="text-xs bg-red-50 p-2 rounded space-y-1">
                  {debugInfo.errors.map((error, i) => (
                    <div key={i} className="text-red-700">⚠️ {error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t p-3 space-y-2">
        <button
          onClick={handleClearCaches}
          className="w-full px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-sm font-medium transition-colors"
        >
          Vider les caches
        </button>
        <button
          onClick={handleUnregister}
          className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
        >
          Désinscrire le SW
        </button>
      </div>
    </div>
  );
};