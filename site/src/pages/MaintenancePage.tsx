import { Settings, Clock, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const MaintenancePage = ({ contactEmail = "contact@example.com" }) => {
  const { language } = useLanguage();

  const translations = {
    fr: {
      title: "Maintenance en cours",
      subtitle: "Nous reviendrons bientôt",
      message: "Notre site est actuellement en maintenance pour vous offrir une meilleure expérience. Nous serons de retour très prochainement !",
      estimate: "Temps estimé",
      soon: "Très bientôt",
      contact: "Besoin de nous contacter ?",
      emailButton: "Envoyer un email",
      refresh: "Actualiser la page",
      refreshDesc: "Cliquez ici pour vérifier si la maintenance est terminée",
      thankyou: "Merci de votre patience"
    },
    en: {
      title: "Under Maintenance",
      subtitle: "We'll be back soon",
      message: "Our site is currently undergoing maintenance to provide you with a better experience. We'll be back very soon!",
      estimate: "Estimated time",
      soon: "Very soon",
      contact: "Need to contact us?",
      emailButton: "Send an email",
      refresh: "Refresh page",
      refreshDesc: "Click here to check if maintenance is complete",
      thankyou: "Thank you for your patience"
    }
  };

  const t = translations[language] || translations.fr;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Icon animé */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative bg-card border-4 border-primary/20 rounded-full p-8 shadow-2xl">
              <Settings className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 md:p-12 text-center space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {t.subtitle}
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t.message}
          </p>

          {/* Temps estimé */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-muted/50 rounded-full">
            <Clock className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium">{t.estimate}</p>
              <p className="text-sm font-bold">{t.soon}</p>
            </div>
          </div>

          {/* Barre de progression animée */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 animate-pulse"
                style={{ 
                  width: '60%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Bouton d'actualisation */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              {t.refreshDesc}
            </p>
            <Button 
              onClick={handleRefresh}
              size="lg"
              variant="outline"
              className="gap-2 group hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              {t.refresh}
            </Button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Footer */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t.thankyou}
            </p>
          </div>
        </div>

        {/* Particles décoratifs */}
        <div className="mt-8 flex justify-center gap-2 opacity-50">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};