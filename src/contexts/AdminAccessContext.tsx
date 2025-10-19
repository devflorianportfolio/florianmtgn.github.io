import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAccessContextType {
  hasAccess: boolean;
  loading: boolean;
  currentIp: string | null;
}

const AdminAccessContext = createContext<AdminAccessContextType>({
  hasAccess: false,
  loading: true,
  currentIp: null,
});

export const useAdminAccess = () => {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error('useAdminAccess must be used within AdminAccessProvider');
  }
  return context;
};

interface AdminAccessProviderProps {
  children: ReactNode;
}

export const AdminAccessProvider = ({ children }: AdminAccessProviderProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIp, setCurrentIp] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('🔍 Début de la vérification d\'accès admin...');
        
        // Récupérer l'IP de l'utilisateur
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        
        if (!ipResponse.ok) {
          throw new Error('Impossible de récupérer l\'IP');
        }
        
        const { ip } = await ipResponse.json();
        
        setCurrentIp(ip);
        console.log('🌐 IP détectée:', ip);
        
        // Vérifier si l'IP est dans la whitelist
        const { data, error } = await supabase
          .from('admin_ips')
          .select('*')
          .eq('ip_address', ip)
          .maybeSingle();

        console.log('📊 Résultat de la requête Supabase:', { data, error });

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          setHasAccess(false);
        } else if (data) {
          console.log('✅ IP autorisée trouvée dans la base:', data);
          setHasAccess(true);
        } else {
          console.log('🚫 IP non trouvée dans la whitelist');
          setHasAccess(false);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
        console.log('✔️ Vérification terminée');
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    console.log('📌 État actuel:', { hasAccess, loading, currentIp });
  }, [hasAccess, loading, currentIp]);

  return (
    <AdminAccessContext.Provider value={{ hasAccess, loading, currentIp }}>
      {children}
    </AdminAccessContext.Provider>
  );
};