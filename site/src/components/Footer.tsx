import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAccess } from "@/contexts/AdminAccessContext";
import { Shield } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const { hasAccess, loading } = useAdminAccess();

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Florian. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-4 md:gap-6 text-sm items-center">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footer.terms')}
            </Link>
            <Link
              to="/legal"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footer.legal')}
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('cookieConsent');
                window.location.reload();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footer.cookies')}
            </button>
            {!loading && hasAccess && (
              <Link
                to="/auth"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
};