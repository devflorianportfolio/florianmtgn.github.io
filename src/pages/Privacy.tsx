import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Database, Lock, Share2, UserCheck, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Privacy = () => {
  const { language } = useLanguage();

  const sections = language === 'en' ? [
    {
      icon: Database,
      title: "Information Collection",
      content: "We collect information you provide directly to us when using our portfolio website, including but not limited to: contact form submissions, email addresses, and optional information you choose to share. We also automatically collect certain technical data such as IP addresses, browser type, and visit duration for analytics purposes."
    },
    {
      icon: Lock,
      title: "Use of Information",
      content: "We use the information we collect to provide, maintain, and improve our services, respond to your inquiries, send you technical notices and updates, monitor and analyze trends and usage, and protect against fraudulent or illegal activity. Your data is never used for unsolicited marketing."
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: "We do not share, sell, or rent your personal information with third parties for their marketing purposes. We may share data only with trusted service providers who assist us in operating our website, under strict confidentiality agreements, or when required by law."
    },
    {
      icon: Shield,
      title: "Data Security",
      content: "We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security."
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information at any time. You can also request data portability, restrict processing, and object to certain data uses. To exercise these rights, please contact us through our contact form."
    },
    {
      icon: Mail,
      title: "Contact & Questions",
      content: "For any questions, concerns, or requests regarding this privacy policy or your personal data, please don't hesitate to contact us. We are committed to addressing your privacy concerns promptly and transparently."
    }
  ] : [
    {
      icon: Database,
      title: "Collecte des informations",
      content: "Nous collectons les informations que vous nous fournissez directement lors de l'utilisation de notre site portfolio, notamment : soumissions de formulaire de contact, adresses e-mail et informations optionnelles que vous choisissez de partager. Nous collectons également automatiquement certaines données techniques telles que les adresses IP, le type de navigateur et la durée de visite à des fins d'analyse."
    },
    {
      icon: Lock,
      title: "Utilisation des informations",
      content: "Nous utilisons les informations collectées pour fournir, maintenir et améliorer nos services, répondre à vos demandes, vous envoyer des notifications techniques et mises à jour, surveiller et analyser les tendances et l'utilisation, et protéger contre les activités frauduleuses ou illégales. Vos données ne sont jamais utilisées pour du marketing non sollicité."
    },
    {
      icon: Share2,
      title: "Partage des informations",
      content: "Nous ne partageons, ne vendons ni ne louons vos informations personnelles à des tiers à des fins de marketing. Nous pouvons partager des données uniquement avec des prestataires de services de confiance qui nous aident à exploiter notre site web, sous accords de confidentialité stricts, ou lorsque requis par la loi."
    },
    {
      icon: Shield,
      title: "Sécurité des données",
      content: "Nous mettons en œuvre des mesures de sécurité conformes aux normes de l'industrie, incluant le cryptage SSL, des serveurs sécurisés et des audits de sécurité réguliers pour protéger vos informations personnelles. Cependant, aucune méthode de transmission sur Internet n'est sûre à 100%, et nous ne pouvons garantir une sécurité absolue."
    },
    {
      icon: UserCheck,
      title: "Vos droits",
      content: "Vous avez le droit d'accéder, de corriger ou de supprimer vos informations personnelles à tout moment. Vous pouvez également demander la portabilité des données, restreindre le traitement et vous opposer à certaines utilisations. Pour exercer ces droits, veuillez nous contacter via notre formulaire de contact."
    },
    {
      icon: Mail,
      title: "Contact et questions",
      content: "Pour toute question, préoccupation ou demande concernant cette politique de confidentialité ou vos données personnelles, n'hésitez pas à nous contacter. Nous nous engageons à traiter vos préoccupations en matière de confidentialité rapidement et de manière transparente."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5 border-b border-border">
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
            {language === 'en' ? 'Privacy Policy' : 'Politique de confidentialité'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            {language === 'en' 
              ? 'How we collect, use, and protect your personal information' 
              : 'Comment nous collectons, utilisons et protégeons vos informations personnelles'}
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
              className="group relative bg-card border border-border rounded-xl p-6 md:p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
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

        {/* GDPR Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-6 rounded-lg bg-blue-500/5 border border-blue-500/20"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2 text-blue-600">
                {language === 'en' ? 'GDPR Compliance' : 'Conformité RGPD'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'This privacy policy is compliant with the General Data Protection Regulation (GDPR) and ensures your rights are protected. Last updated: October 2025.' 
                  : 'Cette politique de confidentialité est conforme au Règlement Général sur la Protection des Données (RGPD) et garantit la protection de vos droits. Dernière mise à jour : Octobre 2025.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;