import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteConfig = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["siteConfig"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<any>) => {
      const { data: existingData } = await supabase
        .from("site_config")
        .select("id")
        .single();

      if (!existingData?.id) {
        throw new Error("Configuration non trouvée");
      }

      const { data, error } = await supabase
        .from("site_config")
        .update(updates)
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteConfig"] });
    },
  });

  return {
    config: data,
    isLoading,
    error,
    updateConfig: updateConfig.mutate,
    isUpdating: updateConfig.isPending,
  };
};