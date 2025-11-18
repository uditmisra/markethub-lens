import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "reviewer" | "submitter";

export const useUserRole = () => {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((r) => r.role as UserRole);
    },
  });

  const isAdmin = roles.includes("admin");
  const isReviewer = roles.includes("reviewer");
  const isSubmitter = roles.includes("submitter");

  const canApprove = isAdmin || isReviewer;
  const canDelete = isAdmin;
  const canEditAll = isAdmin || isReviewer;

  return {
    roles,
    isAdmin,
    isReviewer,
    isSubmitter,
    canApprove,
    canDelete,
    canEditAll,
    isLoading,
  };
};
