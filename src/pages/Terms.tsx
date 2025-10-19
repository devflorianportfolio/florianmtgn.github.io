import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, FileCheck, Download, AlertTriangle, Scale, RefreshCw, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Terms = () => {
  const { language } = useLanguage();

  const sections = language === 'en' ? [
    {
      icon: FileCheck,
      title: "Acceptance of Terms",
      content: "By accessing and using this website, you acknowledge that you have read, understood, and agree to be bound by these terms of use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      icon: Download,
      title: "Use License",
      content: "Permission is granted to temporarily download one copy of the materials (photographs, information, or software) on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title. Under this license, you may not: modify or copy the materials, use the materials for commercial purposes, attempt to reverse engineer any software, remove copyright or proprietary notations, or transfer the materials to another person."
    },
    {
      icon: AlertTriangle,
      title: "Disclaimer",
      content: "The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property."
    },
    {
      icon: Scale,
      title: "Limitations of Liability",
      content: "In no event shall Florian or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage."
    },
    {
      icon: RefreshCw,
      title: "Revisions and Modifications",
      content: "We may revise these terms of use for our website at any time without prior notice. By using this website, you are agreeing to be bound by the current version of these terms of use. We reserve the right to update, change, or replace any part of these Terms by posting updates on this page."
    },
    {
      icon: Globe,
      title: "Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of France, and you irrevocably submit to the exclusive jurisdiction of the courts in that location. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the French courts."
    }
  ] : [
    {
      icon: FileCheck,
      title: "Acceptation des conditions",
      content: "En accédant et en utilisant ce site web, vous reconnaissez avoir lu, compris et accepté d'être lié par ces conditions d'utilisation et toutes les lois et réglementations applicables. Si vous n'acceptez pas l'une de ces conditions, il vous est interdit d'utiliser ou d'accéder à ce site."
    },
    {
      icon: Download,
      title: "Licence d'utilisation",
      content: "L'autorisation est accordée de télécharger temporairement une copie des matériaux (photographies, informations ou logiciels) sur ce site web pour un usage personnel et non commercial uniquement. Il s'agit de l'octroi d'une licence, et non d'un transfert de titre. Dans le cadre de cette licence, vous ne pouvez pas : modifier ou copier les matériaux, utiliser les matériaux à des fins commerciales, tenter de faire de l'ingénierie inverse de tout logiciel, retirer les mentions de droit d'auteur ou propriétaires, ou transférer les matériaux à une autre personne."
    },
    {
      icon: AlertTriangle,
      title: "Clause de non-responsabilité",
      content: "Les matériaux de ce site web sont fournis 'tels quels'. Nous ne donnons aucune garantie, expresse ou implicite, et déclinons et annulons par la présente toutes autres garanties, y compris, sans limitation, les garanties implicites ou conditions de qualité marchande, d'adéquation à un usage particulier ou de non-violation de la propriété intellectuelle."
    },
    {
      icon: Scale,
      title: "Limitations de responsabilité",
      content: "En aucun cas, Florian ou ses fournisseurs ne seront responsables des dommages (y compris, sans limitation, les dommages pour perte de données ou de profit, ou en raison d'une interruption d'activité) résultant de l'utilisation ou de l'impossibilité d'utiliser les matériaux de ce site web, même si nous ou un représentant autorisé a été notifié oralement ou par écrit de la possibilité de tels dommages."
    },
    {
      icon: RefreshCw,
      title: "Révisions et modifications",
      content: "Nous pouvons réviser ces conditions d'utilisation de notre site web à tout moment sans préavis. En utilisant ce site web, vous acceptez d'être lié par la version actuelle de ces conditions d'utilisation. Nous nous réservons le droit de mettre à jour, modifier ou remplacer toute partie de ces Conditions en publiant des mises à jour sur cette page."
    },
    {
      icon: Globe,
      title: "Loi applicable",
      content: "Ces termes et conditions sont régis et interprétés conformément aux lois de la France, et vous vous soumettez irrévocablement à la juridiction exclusive des tribunaux de ce lieu. Tout litige relatif à ces conditions sera soumis à la juridiction exclusive des tribunaux français."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-500/5 via-background to-emerald-500/5 border-b border-border">
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
            {language === 'en' ? 'Terms of Use' : "Conditions d'utilisation"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            {language === 'en' 
              ? 'Terms and conditions governing the use of this website' 
              : "Termes et conditions régissant l'utilisation de ce site web"}
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
              className="group relative bg-card border border-border rounded-xl p-6 md:p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-green-600 transition-colors">
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

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-6 rounded-lg bg-amber-500/5 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2 text-amber-600">
                {language === 'en' ? 'Important Notice' : 'Avis important'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Please read these terms carefully before using this website. Your continued use constitutes acceptance of these terms. For questions or clarifications, please contact us. Effective date: October 2025.' 
                  : "Veuillez lire attentivement ces conditions avant d'utiliser ce site web. Votre utilisation continue constitue l'acceptation de ces conditions. Pour toute question ou clarification, veuillez nous contacter. Date d'entrée en vigueur : Octobre 2025."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;