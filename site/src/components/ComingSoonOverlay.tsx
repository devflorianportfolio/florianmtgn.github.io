import { Lock, Sparkles } from "lucide-react";

export const ComingSoonOverlay = ({ children, language = "fr" }) => {
  const translations = {
    fr: "Prochainement...",
    en: "Coming soon..."
  };

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none blur-[2px] grayscale">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-md rounded-xl">
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-card/95 to-card/80  backdrop-blur-sm">

          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 p-6 rounded-2xl border border-primary/20 shadow-lg">
              <Lock className="w-10 h-10 text-primary drop-shadow-lg" strokeWidth={2.5} />
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {translations[language]}
            </p>
            <div className="flex gap-1 justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Badge décoratif */}
          <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <p className="text-xs font-medium text-primary/80 tracking-wide">
              {language === "fr" ? "En développement" : "In development"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};