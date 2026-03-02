import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProofAnalytics = (evidenceId?: string) => {
  const { data: stats } = useQuery({
    queryKey: ["proof-analytics", evidenceId],
    enabled: !!evidenceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proof_events")
        .select("event_type, format")
        .eq("evidence_id", evidenceId!);
      if (error) throw error;
      const views = data.filter((e) => e.event_type === "view").length;
      const copies = data.filter((e) => e.event_type === "copy").length;
      return { views, copies };
    },
  });

  const track = useMutation({
    mutationFn: async ({ eventType, format }: { eventType: "view" | "copy"; format?: string }) => {
      if (!evidenceId) return;
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("proof_events").insert({
        evidence_id: evidenceId,
        event_type: eventType,
        format: format ?? null,
        user_id: user?.id ?? null,
      });
    },
  });

  return { stats: stats ?? { views: 0, copies: 0 }, track };
};
