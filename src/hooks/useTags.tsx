import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tag, TagCategory } from "@/types/tags";

export type { Tag, TagCategory };

export const useTags = () => {
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("category")
        .order("name");
      if (error) throw error;
      return data as Tag[];
    },
  });

  const createTag = useMutation({
    mutationFn: async (tag: { name: string; category: TagCategory; color?: string }) => {
      const { data, error } = await supabase
        .from("tags")
        .insert(tag)
        .select()
        .single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
  });

  const addTagToEvidence = useMutation({
    mutationFn: async ({ evidenceId, tagId }: { evidenceId: string; tagId: string }) => {
      const { error } = await supabase
        .from("evidence_tags")
        .insert({ evidence_id: evidenceId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      queryClient.invalidateQueries({ queryKey: ["proof"] });
    },
  });

  const removeTagFromEvidence = useMutation({
    mutationFn: async ({ evidenceId, tagId }: { evidenceId: string; tagId: string }) => {
      const { error } = await supabase
        .from("evidence_tags")
        .delete()
        .eq("evidence_id", evidenceId)
        .eq("tag_id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      queryClient.invalidateQueries({ queryKey: ["proof"] });
    },
  });

  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Partial<Record<TagCategory, Tag[]>>);

  return {
    tags,
    tagsByCategory,
    isLoading,
    createTag,
    deleteTag,
    addTagToEvidence,
    removeTagFromEvidence,
  };
};
