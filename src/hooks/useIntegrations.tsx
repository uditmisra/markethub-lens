import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type IntegrationType = "g2" | "capterra";
export type SyncStatus = "pending" | "running" | "completed" | "failed";

export interface Integration {
  id: string;
  integration_type: IntegrationType;
  product_id: string;
  config: {
    api_key?: string;
    created_by?: string;
  };
  is_active: boolean;
  sync_frequency: string;
  last_sync_at?: string;
  last_sync_status?: SyncStatus;
  last_sync_error?: string;
  created_at: string;
  updated_at: string;
}

export const useIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Integration[];
    },
  });

  const createIntegration = useMutation({
    mutationFn: async (integration: Omit<Integration, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("integrations")
        .insert({
          ...integration,
          config: {
            ...integration.config,
            created_by: user?.id,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Integration> & { id: string }) => {
      const { data, error } = await supabase
        .from("integrations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const triggerSync = useMutation({
    mutationFn: async (integrationId: string) => {
      const integration = integrations.find((i) => i.id === integrationId);
      if (!integration) throw new Error("Integration not found");

      const functionName = integration.integration_type === "g2" 
        ? "sync-g2-reviews" 
        : "sync-capterra-reviews";

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { integrationId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success",
        description: "Sync triggered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to trigger sync: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    integrations,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    triggerSync,
  };
};
