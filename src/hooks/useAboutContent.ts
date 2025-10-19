import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAboutContent = () => {
  const query = useQuery({
    queryKey: ["about-content"],
    queryFn: async () => {
      console.log('Fetching about content...');
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching about content:', error);
        throw error;
      }
      
      return data;
    },
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};