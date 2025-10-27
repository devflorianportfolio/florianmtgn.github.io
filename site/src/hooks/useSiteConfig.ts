import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SiteConfig {
  id: string;
  theme_mode: 'light' | 'dark' | 'both';
  default_theme: 'light' | 'dark';
  allow_theme_switch: boolean;
  site_name: string;
  site_description: string;
  site_language: 'fr' | 'en';
  maintenance_mode: boolean;
  images_per_page: number;
  enable_image_download: boolean;
  watermark_enabled: boolean;
  gallery_layout: 'grid' | 'masonry' | 'justified';
  lazy_loading_enabled: boolean;
  image_compression_quality: number;
  enable_animations: boolean;
  meta_title: string;
  meta_keywords: string;
  enable_analytics: boolean;
  disable_right_click: boolean;
  watermark_text: string;
  watermark_opacity: number;
  updated_at?: string;
  created_at?: string;
}

const DEFAULT_CONFIG: Partial<SiteConfig> = {
  theme_mode: 'both',
  default_theme: 'light',
  allow_theme_switch: true,
  site_name: 'Mon Portfolio',
  site_description: '',
  site_language: 'fr',
  maintenance_mode: false,
  images_per_page: 12,
  enable_image_download: false,
  watermark_enabled: false,
  gallery_layout: 'grid',
  lazy_loading_enabled: true,
  image_compression_quality: 85,
  enable_animations: true,
  meta_title: '',
  meta_keywords: '',
  enable_analytics: true,
  disable_right_click: false,
  watermark_text: '',
  watermark_opacity: 30,
};

export const useSiteConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newConfig, error: insertError } = await supabase
            .from('site_config')
            .insert(DEFAULT_CONFIG)
            .select()
            .single();

          if (insertError) throw insertError;
          return newConfig as SiteConfig;
        }
        throw error;
      }

      return data as SiteConfig;
    },
  });

  const { mutateAsync: updateConfig, isPending: isUpdating } = useMutation({
    mutationFn: async (newConfig: Partial<SiteConfig>) => {
      const { data, error } = await supabase
        .from('site_config')
        .update(newConfig)
        .eq('id', config?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
    },
    onError: (error) => {
      console.error('Error updating config:', error);
      throw error;
    },
  });

  const { mutateAsync: resetConfig, isPending: isResetting } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .update(DEFAULT_CONFIG)
        .eq('id', config?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
      toast({
        title: "✅ Configuration réinitialisée",
        description: "Les paramètres par défaut ont été restaurés",
      });
    },
    onError: (error) => {
      console.error('Error resetting config:', error);
      toast({
        variant: "destructive",
        title: "❌ Erreur",
        description: "Impossible de réinitialiser la configuration",
      });
    },
  });

  return {
    config,
    isLoading,
    updateConfig,
    isUpdating,
    resetConfig,
    isResetting,
    refetch,
  };
};