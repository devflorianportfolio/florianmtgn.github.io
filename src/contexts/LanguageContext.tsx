import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'gallery.all': 'All',
    'about.title': 'About',
    'contact.title': "Let's work together",
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.address': 'Address',
    'admin.gallery': 'Gallery',
    'admin.about': 'About',
    'admin.skills': 'Skills',
    'admin.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.legal': 'Legal Notice',
    'footer.cookies': 'Cookie Settings',
  },
  fr: {
    'nav.work': 'Travaux',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'gallery.all': 'Tous',
    'about.title': 'À propos',
    'contact.title': 'Travaillons ensemble',
    'contact.email': 'Email',
    'contact.phone': 'Téléphone',
    'contact.address': 'Adresse',
    'admin.gallery': 'Galerie',
    'admin.about': 'À propos',
    'admin.skills': 'Compétences',
    'admin.contact': 'Contact',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': "Conditions d'utilisation",
    'footer.legal': 'Mentions légales',
    'footer.cookies': 'Paramètres des cookies',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};