import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSkills = () => {
  const query = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      console.log('Fetching skills...');
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error('Error fetching skills:', error);
        throw error;
      }
      
      console.log('Skills fetched:', data);
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