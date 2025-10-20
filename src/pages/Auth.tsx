import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminAccess } from "@/contexts/AdminAccessContext";
import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasAccess, loading: checkingAccess, currentIp } = useAdminAccess();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Rediriger si l'IP n'est pas autorisée
  useEffect(() => {
    if (!checkingAccess && !hasAccess) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Votre adresse IP n'est pas autorisée à accéder à cette page.",
      });
      
      // Rediriger vers la page d'accueil après 2 secondes
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [checkingAccess, hasAccess, navigate, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Afficher un loader pendant la vérification
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-background via-muted/30 to-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Vérification de l'accès...</p>
        </motion.div>
      </div>
    );
  }

  // Afficher un message d'erreur si l'IP n'est pas autorisée
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-background via-muted/30 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card p-8 rounded-lg shadow-lg border border-destructive">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
              <p className="text-muted-foreground mb-4">
                Votre adresse IP n'est pas autorisée à accéder à cette page.
              </p>
              {currentIp && (
                <p className="text-sm text-muted-foreground mb-6">
                  IP détectée: <code className="bg-muted px-2 py-1 rounded">{currentIp}</code>
                </p>
              )}
              <Button onClick={() => navigate("/")} variant="outline">
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Afficher le formulaire de connexion si l'IP est autorisée
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-background via-muted/30 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-8 rounded-lg shadow-lg border border-border"
        >
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">
              {isLogin ? "Connexion" : "Inscription"}
            </h1>
          </div>
          
          {currentIp && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                IP autorisée: <code className="text-foreground">{currentIp}</code>
              </p>
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Pas de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;