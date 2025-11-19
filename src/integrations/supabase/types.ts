export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      evidence: {
        Row: {
          company: string
          company_size: string | null
          content: string
          created_at: string
          created_by: string | null
          customer_name: string
          email: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          external_id: string | null
          external_url: string | null
          file_url: string | null
          id: string
          imported_at: string | null
          industry: string | null
          integration_source: string | null
          job_title: string | null
          product: Database["public"]["Enums"]["product_type"]
          rating: number | null
          results: string | null
          review_date: string | null
          reviewer_avatar: string | null
          status: Database["public"]["Enums"]["evidence_status"]
          title: string
          updated_at: string
          use_cases: string | null
        }
        Insert: {
          company: string
          company_size?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          customer_name: string
          email: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          external_id?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          imported_at?: string | null
          industry?: string | null
          integration_source?: string | null
          job_title?: string | null
          product: Database["public"]["Enums"]["product_type"]
          rating?: number | null
          results?: string | null
          review_date?: string | null
          reviewer_avatar?: string | null
          status?: Database["public"]["Enums"]["evidence_status"]
          title: string
          updated_at?: string
          use_cases?: string | null
        }
        Update: {
          company?: string
          company_size?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          customer_name?: string
          email?: string
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          external_id?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          imported_at?: string | null
          industry?: string | null
          integration_source?: string | null
          job_title?: string | null
          product?: Database["public"]["Enums"]["product_type"]
          rating?: number | null
          results?: string | null
          review_date?: string | null
          reviewer_avatar?: string | null
          status?: Database["public"]["Enums"]["evidence_status"]
          title?: string
          updated_at?: string
          use_cases?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_failed: number | null
          last_sync_imported: number | null
          last_sync_skipped: number | null
          last_sync_status: Database["public"]["Enums"]["sync_status"] | null
          last_sync_total: number | null
          product_id: string
          sync_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_failed?: number | null
          last_sync_imported?: number | null
          last_sync_skipped?: number | null
          last_sync_status?: Database["public"]["Enums"]["sync_status"] | null
          last_sync_total?: number | null
          product_id: string
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type?: Database["public"]["Enums"]["integration_type"]
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_failed?: number | null
          last_sync_imported?: number | null
          last_sync_skipped?: number | null
          last_sync_status?: Database["public"]["Enums"]["sync_status"] | null
          last_sync_total?: number | null
          product_id?: string
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "submitter"
      evidence_status: "pending" | "approved" | "published" | "archived"
      evidence_type: "testimonial" | "case-study" | "review" | "quote" | "video"
      integration_type: "g2" | "capterra"
      product_type: "platform" | "analytics" | "integration" | "api" | "other"
      sync_status: "pending" | "running" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "reviewer", "submitter"],
      evidence_status: ["pending", "approved", "published", "archived"],
      evidence_type: ["testimonial", "case-study", "review", "quote", "video"],
      integration_type: ["g2", "capterra"],
      product_type: ["platform", "analytics", "integration", "api", "other"],
      sync_status: ["pending", "running", "completed", "failed"],
    },
  },
} as const
