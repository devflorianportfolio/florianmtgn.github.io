import { AlertTriangle, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const MaintenanceBanner = ({ language = "fr" }) => {
  const translations = {
    fr: {
      title: "Mode Maintenance Activé",
      description: "Le site est actuellement en mode maintenance. Seuls les administrateurs peuvent y accéder. Les visiteurs verront une page de maintenance.",
      adminNote: "Vous voyez cette page car vous êtes connecté en tant qu'administrateur."
    },
    en: {
      title: "Maintenance Mode Enabled",
      description: "The site is currently in maintenance mode. Only administrators can access it. Visitors will see a maintenance page.",
      adminNote: "You see this page because you are logged in as an administrator."
    }
  };

  const t = translations[language] || translations.fr;

  return (
    <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
      <AlertTriangle className="h-5 w-5 text-orange-500" />
      <AlertTitle className="flex items-center gap-2 text-orange-500 font-bold">
        <Settings className="w-4 h-4 animate-spin" />
        {t.title}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-sm">{t.description}</p>
        <p className="text-xs text-muted-foreground italic">
          💡 {t.adminNote}
        </p>
      </AlertDescription>
    </Alert>
  );
};