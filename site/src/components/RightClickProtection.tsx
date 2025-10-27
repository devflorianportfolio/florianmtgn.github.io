import { useEffect, useState } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { supabase } from "@/integrations/supabase/client";

export const RightClickProtection = () => {
  const { config } = useSiteConfig();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAdmin(!!session);
      } catch (error) {
        console.error("❌ Erreur lors de la vérification auth:", error);
        setIsAdmin(false);
      }
    };
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsAdmin(true);
      } else if (event === "SIGNED_OUT") {
        setIsAdmin(false);
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      console.log("🔓 Bypass admin activé - protection désactivée");
      return;
    }
    if (!config?.disable_right_click) {
      console.log("🔓 Clic droit activé");
      return;
    }
    console.log("🔒 Protection du clic droit activée");
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      console.log("❌ Tentative de clic droit bloquée");
      return false;
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        console.log("❌ F12 bloqué");
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        console.log("❌ Ctrl+Shift+I bloqué");
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        console.log("❌ Ctrl+Shift+J bloqué");
        return false;
      }
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        console.log("❌ Ctrl+U bloqué");
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        console.log("❌ Ctrl+Shift+C bloqué");
        return false;
      }
    };
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      console.log("❌ Sélection de texte bloquée");
      return false;
    };
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      console.log("❌ Copie bloquée");
      return false;
    };
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      console.log("❌ Glisser-déposer bloqué");
      return false;
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("dragstart", handleDragStart);
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    return () => {
      console.log("🧹 Nettoyage de la protection du clic droit");
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("dragstart", handleDragStart);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [config?.disable_right_click, isAdmin]);

  return null;
};