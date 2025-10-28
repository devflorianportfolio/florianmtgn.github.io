/**
 * Utilitaires pour gérer le cache de manière sécurisée
 * Empêche la perte de données en mode hors ligne
 */

// Vérifier si on peut supprimer le cache en toute sécurité
export const canSafelyClearCache = async (): Promise<boolean> => {
  // 1. Vérifier la connexion internet
  if (!navigator.onLine) {
    console.warn('❌ Cache clearing blocked: Offline');
    return false;
  }

  // 2. Vérifier que l'on peut atteindre le serveur avec timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(window.location.origin, { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors', // Évite les erreurs CORS
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('❌ Cache clearing blocked: Server timeout');
    } else {
      console.warn('❌ Cache clearing blocked: Network error', error);
    }
    return false;
  }
};

// Vérifier si on peut rafraîchir la page en toute sécurité
export const canSafelyRefresh = (): boolean => {
  if (!navigator.onLine) {
    console.warn('⚠️ Refresh blocked: Offline mode');
    return false;
  }
  return true;
};

// Intercepter les tentatives de refresh pour protéger le cache
export const setupRefreshProtection = () => {
  // Intercepter Ctrl+R / Cmd+R / F5
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'r' && (e.ctrlKey || e.metaKey)) || e.key === 'F5') {
      if (!navigator.onLine) {
        e.preventDefault();
        alert('⚠️ Rafraîchissement bloqué en mode hors ligne pour préserver le cache.');
      }
    }
  });

  // Intercepter beforeunload pour avertir l'utilisateur
  window.addEventListener('beforeunload', (e) => {
    if (!navigator.onLine) {
      const message = 'Vous êtes hors ligne. Quitter la page pourrait causer une perte de données en cache.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
  });
};

// Sauvegarder l'état du cache avant mise à jour
export const backupCacheState = async (): Promise<string[]> => {
  try {
    const cacheNames = await caches.keys();
    const backupData: string[] = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      backupData.push(...requests.map(req => req.url));
    }

    // Stocker dans sessionStorage comme backup
    sessionStorage.setItem('cache_backup', JSON.stringify(backupData));
    
    return backupData;
  } catch (error) {
    console.error('Erreur backup cache:', error);
    return [];
  }
};

// Restaurer le cache depuis un backup
export const restoreCacheFromBackup = async (cacheName: string = 'gallery-cache-v1') => {
  try {
    const backupData = sessionStorage.getItem('cache_backup');
    if (!backupData) {
      console.warn('Aucun backup disponible');
      return;
    }

    const urls: string[] = JSON.parse(backupData);
    const cache = await caches.open(cacheName);
    
    
    let restored = 0;
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          restored++;
        }
      } catch (error) {
        console.warn(`Échec restauration ${url}:`, error);
      }
    }

  } catch (error) {
    console.error('Erreur restauration cache:', error);
  }
};

// Obtenir des statistiques sur le cache
export const getCacheStats = async () => {
  try {
    const cacheNames = await caches.keys();
    const stats = {
      totalCaches: cacheNames.length,
      cacheNames: cacheNames,
      totalEntries: 0,
      estimatedSize: '0 MB',
    };

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats.totalEntries += keys.length;
    }

    // Estimer la taille
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usageInMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
      stats.estimatedSize = `${usageInMB} MB`;
    }

    return stats;
  } catch (error) {
    console.error('Erreur stats cache:', error);
    return null;
  }
};

// Nettoyer le cache de manière sécurisée
export const safeClearCache = async (): Promise<boolean> => {
  const isSafe = await canSafelyClearCache();
  
  if (!isSafe) {
    console.error('❌ Nettoyage du cache annulé pour raisons de sécurité');
    return false;
  }

  try {
    // Backup avant de nettoyer
    await backupCacheState();

    // Supprimer tous les caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    return true;
  } catch (error) {
    console.error('Erreur nettoyage cache:', error);
    return false;
  }
};

// Hook personnalisé pour utiliser ces utilitaires
export const useCacheSafety = () => {
  return {
    canSafelyClearCache,
    canSafelyRefresh,
    setupRefreshProtection,
    backupCacheState,
    restoreCacheFromBackup,
    getCacheStats,
    safeClearCache,
  };
};