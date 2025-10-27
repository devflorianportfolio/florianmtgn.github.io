import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

/**
 * Composant de debug pour tester la connexion Realtime
 * À placer temporairement dans App.tsx pour vérifier que tout fonctionne
 */
export const DebugMaintenanceListener = () => {
  const [status, setStatus] = useState<string>("Initializing...");
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("🐛 Debug: Initialisation du listener de test");

    const channel = supabase
      .channel("debug_maintenance")
      .on(
        "postgres_changes",
        {
          event: "*", // Écoute tous les événements
          schema: "public",
          table: "site_config",
        },
        (payload) => {
          console.log("🐛 Debug: Événement reçu", payload);
          setEvents(prev => [
            {
              time: new Date().toLocaleTimeString(),
              event: payload.eventType,
              old: payload.old?.maintenance_mode,
              new: payload.new?.maintenance_mode,
            },
            ...prev
          ].slice(0, 5)); // Garder seulement les 5 derniers
        }
      )
      .subscribe((status) => {
        console.log("🐛 Debug: Statut =", status);
        setStatus(status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("🐛 Debug: Nettoyage");
      supabase.removeChannel(channel);
    };
  }, []);

  // Ne pas afficher en production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-card border-2 border-primary/20 rounded-lg shadow-2xl p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          Debug Realtime
        </h3>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
          isConnected 
            ? "bg-green-500/20 text-green-500" 
            : "bg-red-500/20 text-red-500"
        }`}>
          {status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
          <p className="text-[10px] leading-tight">
            Ce composant écoute les changements de maintenance_mode en temps réel
          </p>
        </div>

        {events.length > 0 && (
          <div className="space-y-1">
            <p className="font-semibold text-[10px] text-muted-foreground">
              Derniers événements:
            </p>
            {events.map((event, i) => (
              <div 
                key={i} 
                className="p-2 bg-accent/20 rounded text-[10px] border border-border"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold">{event.event}</span>
                  <span className="text-muted-foreground">{event.time}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-red-500">Old: {String(event.old)}</span>
                  <span className="text-green-500">New: {String(event.new)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {events.length === 0 && (
          <div className="p-3 bg-muted/30 rounded text-center text-[10px] text-muted-foreground">
            Aucun événement détecté
          </div>
        )}
      </div>
    </div>
  );
};