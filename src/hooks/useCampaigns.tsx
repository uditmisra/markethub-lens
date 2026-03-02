import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  message: string | null;
  status: "active" | "closed";
  created_by: string;
  created_at: string;
  submission_count?: number;
}

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get submission counts
      const { data: counts } = await supabase
        .from("evidence")
        .select("campaign_id")
        .not("campaign_id", "is", null);

      const countMap: Record<string, number> = {};
      (counts ?? []).forEach((r: { campaign_id: string }) => {
        countMap[r.campaign_id] = (countMap[r.campaign_id] ?? 0) + 1;
      });

      return (data ?? []).map((c) => ({
        ...c,
        submission_count: countMap[c.id] ?? 0,
      })) as Campaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (input: { name: string; description?: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("campaigns")
        .insert({ ...input, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { error } = await supabase.from("campaigns").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { campaigns, isLoading, createCampaign, updateCampaign };
};
