// src/components/Contact.tsx
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ContactProps {
  data: {
    email: string;
    phone?: string | null;
    address?: string | null;
  } | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order_index: number;
}

export const Contact = ({ data }: ContactProps) => {
  const { t } = useLanguage();
  const { trackClick, trackConversion } = useAnalytics();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data: links, error } = await supabase
        .from("social_links")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      setSocialLinks(links || []);
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  const iconMap: Record<string, any> = {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Globe,
    Camera,
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Globe;
    return Icon;
  };

  const handleEmailClick = () => {
    trackClick('contact_email', 'email', data?.email || '');
    trackConversion('email_click', data?.email || '');
  };

  const handlePhoneClick = () => {
    trackClick('contact_phone', 'phone', data?.phone || '');
    trackConversion('phone_click', data?.phone || '');
  };

  const handleSocialClick = (platform: string, url: string) => {
    trackClick('social_link', platform, url);
    trackConversion('social_click', platform);
  };
  
  if (!data) return null;

  const contactItems = [
    data.email && {
      icon: Mail,
      title: t('contact.email'),
      value: data.email,
      href: `mailto:${data.email}`,
      onClick: handleEmailClick,
      delay: 0.1
    },
    data.phone && {
      icon: Phone,
      title: t('contact.phone'),
      value: data.phone,
      href: `tel:${data.phone}`,
      onClick: handlePhoneClick,
      delay: 0.2
    },
    data.address && {
      icon: MapPin,
      title: t('contact.address'),
      value: data.address,
      href: null,
      onClick: null,
      delay: 0.3
    }
  ].filter(Boolean) as Array<{
    icon: any;
    title: string;
    value: string;
    href: string | null;
    onClick: (() => void) | null;
    delay: number;
  }>;

  return (
    <section id="contact" className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold mb-12 text-center"
        >
          {t('contact.title')}
        </motion.h2>

        {/* Contact Info Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="w-7 h-7 mb-3 text-muted-foreground group-hover:text-accent transition-colors" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground break-words">{item.value}</p>
              </>
            );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: item.delay }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group p-6 rounded-lg bg-background border border-border hover:border-accent transition-all"
              >
                {item.href ? (
                  <a href={item.href} onClick={item.onClick || undefined} className="block">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-6">Retrouvez-moi sur</h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {socialLinks.map((link, index) => {
                const Icon = getIcon(link.icon);
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick(link.platform, link.url)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.15, y: -5 }}
                    className="group p-4 rounded-full bg-background border border-border hover:border-accent hover:bg-accent/10 transition-all"
                    title={link.platform}
                  >
                    <Icon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};