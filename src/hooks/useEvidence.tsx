import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Evidence, EvidenceStatus } from "@/types/evidence";
import { useToast } from "@/hooks/use-toast";

export const useEvidence = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: evidence = [], isLoading } = useQuery({
    queryKey: ["evidence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map database fields to Evidence type
      return (data || []).map((item) => ({
        id: item.id,
        customerName: item.customer_name,
        company: item.company,
        email: item.email,
        jobTitle: item.job_title,
        evidenceType: item.evidence_type,
        product: item.product,
        title: item.title,
        content: item.content,
        results: item.results,
        useCases: item.use_cases,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
        fileUrl: item.file_url,
        integration_source: item.integration_source,
        external_id: item.external_id,
        external_url: item.external_url,
        imported_at: item.imported_at,
        company_size: item.company_size,
        industry: item.industry,
        rating: item.rating,
        review_date: item.review_date,
        reviewer_avatar: item.reviewer_avatar,
      })) as Evidence[];
    },
  });

  // Query for pending count (for badge)
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["evidence-pending-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("evidence")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
  });

  const createEvidence = useMutation({
    mutationFn: async (newEvidence: Omit<Evidence, "id" | "createdAt" | "updatedAt" | "status">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("evidence")
        .insert([
          {
            customer_name: newEvidence.customerName,
            company: newEvidence.company,
            email: newEvidence.email,
            job_title: newEvidence.jobTitle,
            evidence_type: newEvidence.evidenceType,
            product: newEvidence.product,
            title: newEvidence.title,
            content: newEvidence.content,
            results: newEvidence.results,
            use_cases: newEvidence.useCases,
            created_by: user.id,
            file_url: newEvidence.fileUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success!",
        description: "Evidence submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEvidence = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Evidence> }) => {
      const { data, error } = await supabase
        .from("evidence")
        .update({
          customer_name: updates.customerName,
          company: updates.company,
          email: updates.email,
          job_title: updates.jobTitle,
          evidence_type: updates.evidenceType,
          product: updates.product,
          title: updates.title,
          content: updates.content,
          results: updates.results,
          use_cases: updates.useCases,
          status: updates.status,
          file_url: updates.fileUrl,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success!",
        description: "Evidence updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEvidence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("evidence")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success!",
        description: "Evidence deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const archiveEvidence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("evidence")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success!",
        description: "Evidence archived successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkUpdateEvidence = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: EvidenceStatus }) => {
      const { error } = await supabase
        .from("evidence")
        .update({ status })
        .in("id", ids);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success!",
        description: `${count} items updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteEvidence = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("evidence")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast({
        title: "Success!",
        description: `${count} items deleted successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    evidence,
    isLoading,
    pendingCount,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    archiveEvidence,
    bulkUpdateEvidence,
    bulkDeleteEvidence,
  };
};
