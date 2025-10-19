import { useLanguage } from '@/contexts/LanguageContext';

interface AboutProps {
  data?: {
    name_fr: string;
    name_en: string;
    subtitle_fr: string;
    subtitle_en: string;
    description_fr: string;
    description_en: string;
  };
  skills?: Array<{
    title_fr: string;
    title_en: string;
    description_fr: string;
    description_en: string;
  }>;
}

export const About = ({ data, skills }: AboutProps) => {
  const { language } = useLanguage();

  if (!data) {
    console.error('No data provided to About component');
    return (
      <section id="about" className="py-32 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground text-lg">
            {language === 'fr' ? '⚠️ Aucune donnée' : '⚠️ No data'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'fr' ? 'Vérifiez votre connexion à la base de données' : 'Check your database connection'}
          </p>
        </div>
      </section>
    );
  }

  const getText = (fr: string, en: string) => {
    return language === 'fr' ? fr : en;
  };

  return (
    <section id="about" className="py-32 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
          {getText(data.name_fr, data.name_en)}
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
          {getText(data.subtitle_fr, data.subtitle_en)}
        </p>
        <p className="text-lg text-muted-foreground mb-16 leading-relaxed">
          {getText(data.description_fr, data.description_en)}
        </p>

        {skills && skills.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-xl font-semibold mb-3">
                  {getText(skill.title_fr, skill.title_en)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getText(skill.description_fr, skill.description_en)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};