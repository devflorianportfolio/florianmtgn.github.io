import { motion } from "framer-motion";
import { useAboutContent } from "@/hooks/useAboutContent";
import { useSkills } from "@/hooks/useSkills";
import { Skeleton } from "./ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export const AnimatedAbout = () => {
  const { data: aboutData, isLoading: aboutLoading } = useAboutContent();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { language } = useLanguage();

  if (aboutLoading || skillsLoading) {
    return (
      <section className="py-32 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-16" />
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!aboutData || !skills) return null;

  // Récupère les données dans la langue appropriée avec fallback
  const getName = () => {
    if (language === 'fr') {
      return aboutData.name_fr || aboutData.name;
    }
    return aboutData.name_en || aboutData.name;
  };

  const getSubtitle = () => {
    if (language === 'fr') {
      return aboutData.subtitle_fr || aboutData.subtitle;
    }
    return aboutData.subtitle_en || aboutData.subtitle;
  };

  const getDescription = () => {
    if (language === 'fr') {
      return aboutData.description_fr || aboutData.description;
    }
    return aboutData.description_en || aboutData.description;
  };

  return (
    <section id="about" className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          {getName()}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
        >
          {getSubtitle()}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-muted-foreground mb-16 leading-relaxed"
        >
          {getDescription()}
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {skills.map((skill, index) => {
            // Récupère les données de skill dans la langue appropriée avec fallback
            const getTitle = () => {
              if (language === 'fr') {
                return skill.title_fr || skill.title;
              }
              return skill.title_en || skill.title;
            };

            const getSkillDescription = () => {
              if (language === 'fr') {
                return skill.description_fr || skill.description;
              }
              return skill.description_en || skill.description;
            };
            
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-6 rounded-lg bg-background/50 backdrop-blur-sm"
              >
                <h3 className="text-xl font-semibold mb-3">{getTitle()}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getSkillDescription()}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};