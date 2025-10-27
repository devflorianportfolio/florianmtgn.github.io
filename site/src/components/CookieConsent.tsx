import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-card border-t border-border shadow-lg"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.'
                : 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.'}
            </p>
            <div className="flex gap-3">
              <Button onClick={rejectCookies} variant="outline" size="sm">
                {language === 'en' ? 'Reject' : 'Refuser'}
              </Button>
              <Button onClick={acceptCookies} size="sm">
                {language === 'en' ? 'Accept' : 'Accepter'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};