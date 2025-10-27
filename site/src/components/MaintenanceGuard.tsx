import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { MaintenancePage } from "@/pages/MaintenancePage";
import { MaintenanceBanner } from "./MaintenanceBanner";
import { useLanguage } from "@/contexts/LanguageContext";

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { config, isLoading } = useSiteConfig();
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        checkAuth();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  };
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {language === "fr" ? "Chargement..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }
  if (config?.maintenance_mode) {
    if (isAdmin) {
      return (
        <>
          <MaintenanceBanner language={language} />
          {children}
        </>
      );
    }
    return (
      <MaintenancePage 
        contactEmail={config?.site_name || "contact@example.com"} 
      />
    );
  }
  return <>{children}</>;
};