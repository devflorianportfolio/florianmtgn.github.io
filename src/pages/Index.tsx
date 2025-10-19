// src/pages/Index.tsx
import { Header } from "@/components/Header";
import { AnimatedGallery } from "@/components/AnimatedGallery";
import { AnimatedAbout } from "@/components/AnimatedAbout";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { useContactInfo } from "@/hooks/useContactInfo";
import { usePageTracking } from "@/hooks/useAnalytics";

const Index = () => {
  const { data: contactData } = useContactInfo();
  
  usePageTracking("Accueil");

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AnimatedGallery />
        <AnimatedAbout />
        {contactData && <Contact data={contactData} />}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;