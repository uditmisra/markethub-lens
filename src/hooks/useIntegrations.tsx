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
    product_uuid?: string;
    product_slug?: string;
    product_name?: string;
  };
  is_active: boolean;
  sync_frequency: string;
  last_sync_at?: string;
  last_sync_status?: SyncStatus;
  last_sync_error?: string;
  last_sync_total?: number;
  last_sync_imported?: number;
  last_sync_skipped?: number;
  last_sync_failed?: number;
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
      
      // For G2 integrations, resolve product slug to UUID
      let configToSave = {
        ...integration.config,
        created_by: user?.id,
      };

      if (integration.integration_type === "g2" && integration.product_id) {
        const apiKey = integration.config?.api_key as string;
        
        if (!apiKey) {
          throw new Error("API key is required");
        }

        // Call resolve-g2-product function
        const { data: resolveData, error: resolveError } = await supabase.functions.invoke(
          'resolve-g2-product',
          {
            body: { 
              productSlug: integration.product_id,
              apiKey 
            },
          }
        );

        if (resolveError) {
          throw new Error(`Failed to resolve product: ${resolveError.message}`);
        }

        // Add resolved UUID to config
        configToSave = {
          ...configToSave,
          product_uuid: resolveData.productUuid,
          product_slug: integration.product_id,
          product_name: resolveData.productName,
        };
      }
      
      const { data, error } = await supabase
        .from("integrations")
        .insert({
          ...integration,
          config: configToSave,
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
      // If updating a G2 integration's product_id, resolve the new slug to UUID
      let updatesToSave = { ...updates };

      if (updates.integration_type === "g2" && updates.product_id) {
        const apiKey = updates.config?.api_key as string;
        
        if (apiKey) {
          // Call resolve-g2-product function
          const { data: resolveData, error: resolveError } = await supabase.functions.invoke(
            'resolve-g2-product',
            {
              body: { 
                productSlug: updates.product_id,
                apiKey 
              },
            }
          );

          if (resolveError) {
            throw new Error(`Failed to resolve product: ${resolveError.message}`);
          }

          // Update config with resolved UUID
          updatesToSave = {
            ...updatesToSave,
            config: {
              ...updates.config,
              product_uuid: resolveData.productUuid,
              product_slug: updates.product_id,
              product_name: resolveData.productName,
            },
          };
        }
      }

      const { data, error } = await supabase
        .from("integrations")
        .update(updatesToSave)
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
