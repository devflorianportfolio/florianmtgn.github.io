import { Sun, Moon } from "lucide-react";

export const ThemePreview = ({ mode, defaultTheme }) => {
  const getPreviewThemes = () => {
    if (mode === 'light') return ['light'];
    if (mode === 'dark') return ['dark'];
    return ['light', 'dark'];
  };

  const themes = getPreviewThemes();
  const isDefaultLight = defaultTheme === 'light';

  return (
    <div className="mt-4 p-4 bg-background rounded-lg border">
      <p className="text-xs font-medium text-muted-foreground mb-3">
        Aperçu du thème / Theme Preview
      </p>
      
      <div className={`grid ${themes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {themes.map((theme) => {
          const isDefault = mode === 'both' && theme === defaultTheme;
          const isLight = theme === 'light';
          
          return (
            <div
              key={theme}
              className={`
                relative rounded-lg overflow-hidden border-2 transition-all
                ${isDefault ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}
              `}
            >
              {/* Badge par défaut */}
              {isDefault && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg">
                  {isDefaultLight ? '☀️' : '🌙'} PAR DÉFAUT
                </div>
              )}

              {/* Contenu du thème */}
              <div className={`p-4 ${isLight ? 'bg-white' : 'bg-zinc-900'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    {isLight ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-400" />
                    )}
                    <span className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {isLight ? 'Thème Clair' : 'Thème Sombre'}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className={`h-2 rounded ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} style={{ width: '80%' }} />
                  <div className={`h-2 rounded ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} style={{ width: '60%' }} />
                  <div className={`h-2 rounded ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} style={{ width: '90%' }} />
                </div>

                {/* Card */}
                <div className={`mt-3 p-3 rounded-lg ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
                  <div className={`h-1.5 rounded ${isLight ? 'bg-gray-300' : 'bg-gray-600'} mb-2`} style={{ width: '70%' }} />
                  <div className={`h-1.5 rounded ${isLight ? 'bg-gray-300' : 'bg-gray-600'}`} style={{ width: '50%' }} />
                </div>

                {/* Button */}
                <div className="mt-3">
                  <div className={`inline-block px-3 py-1.5 rounded text-xs font-medium ${isLight ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                    Bouton d'action
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mode === 'both' && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {isDefaultLight 
            ? "👆 Les visiteurs verront d'abord le thème clair, mais pourront basculer vers le sombre"
            : "👆 Les visiteurs verront d'abord le thème sombre, mais pourront basculer vers le clair"
          }
        </p>
      )}
    </div>
  );
};