import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Building2, User, Server, Shield, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Legal = () => {
  const { language } = useLanguage();

  const sections = language === 'en' ? [
    {
      icon: Building2,
      title: "Site Owner",
      content: "This website is owned and operated by Florian, professional photographer based in Paris, France. All content showcased represents original work and creative vision."
    },
    {
      icon: User,
      title: "Publication Director",
      content: "Florian - Professional Photographer specializing in portrait, landscape, and commercial photography."
    },
    {
      icon: Server,
      title: "Hosting",
      content: "This website is hosted on Lovable Cloud infrastructure, ensuring high availability, security, and optimal performance worldwide."
    },
    {
      icon: Shield,
      title: "Intellectual Property",
      content: "All photographs, designs, text, and visual content on this website are the exclusive property of Florian and are protected by international copyright laws. Any unauthorized use, reproduction, or distribution is strictly prohibited without prior written consent."
    },
    {
      icon: Palette,
      title: "Credits",
      content: "Website design and development: Florian. All photography: Florian. Special thanks to the community for inspiration and support."
    }
  ] : [
    {
      icon: Building2,
      title: "Propriétaire du site",
      content: "Ce site web est la propriété de et est exploité par Florian, photographe professionnel basé à Paris, France. Tout le contenu présenté représente un travail original et une vision créative."
    },
    {
      icon: User,
      title: "Directeur de la publication",
      content: "Florian - Photographe professionnel spécialisé dans le portrait, le paysage et la photographie commerciale."
    },
    {
      icon: Server,
      title: "Hébergement",
      content: "Ce site web est hébergé sur l'infrastructure Lovable Cloud, garantissant une haute disponibilité, sécurité et performances optimales dans le monde entier."
    },
    {
      icon: Shield,
      title: "Propriété intellectuelle",
      content: "Toutes les photographies, designs, textes et contenus visuels de ce site web sont la propriété exclusive de Florian et sont protégés par les lois internationales sur le droit d'auteur. Toute utilisation, reproduction ou distribution non autorisée est strictement interdite sans consentement écrit préalable."
    },
    {
      icon: Palette,
      title: "Crédits",
      content: "Conception et développement du site : Florian. Toutes les photographies : Florian. Remerciements spéciaux à la communauté pour l'inspiration et le soutien."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'en' ? 'Back to site' : 'Retour au site'}</span>
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            {language === 'en' ? 'Legal Notice' : 'Mentions légales'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            {language === 'en' 
              ? 'Important legal information about this website' 
              : 'Informations légales importantes concernant ce site'}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-6 rounded-lg bg-muted/50 border border-border"
        >
          <p className="text-sm text-muted-foreground text-center">
            {language === 'en' 
              ? 'Last updated: October 2025 • For any questions, please contact us through the contact form.' 
              : 'Dernière mise à jour : Octobre 2025 • Pour toute question, veuillez nous contacter via le formulaire de contact.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;