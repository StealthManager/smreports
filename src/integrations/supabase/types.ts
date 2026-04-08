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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ad_spend: {
        Row: {
          amount: number
          channel: string
          clicks: number | null
          closer_id: string | null
          created_at: string
          id: string
          impressions: number | null
          month: string
          product: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          channel: string
          clicks?: number | null
          closer_id?: string | null
          created_at?: string
          id?: string
          impressions?: number | null
          month: string
          product?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: string
          clicks?: number | null
          closer_id?: string | null
          created_at?: string
          id?: string
          impressions?: number | null
          month?: string
          product?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_spend_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "closers"
            referencedColumns: ["id"]
          },
        ]
      }
      closers: {
        Row: {
          created_at: string
          ghl_user_id: string | null
          id: string
          is_active: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ghl_user_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ghl_user_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key_ref: string | null
          config: Json | null
          created_at: string
          id: string
          last_sync_at: string | null
          leads_imported: number | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          api_key_ref?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          leads_imported?: number | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          api_key_ref?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          leads_imported?: number | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          closed_on: string | null
          closer_id: string | null
          company: string | null
          created_at: string
          deal_size: number | null
          first_call_date: string | null
          ghl_contact_id: string | null
          id: string
          last_followup: string | null
          name: string
          next_steps: string | null
          pipeline_stage: Database["public"]["Enums"]["lead_stage"]
          qualification:
            | Database["public"]["Enums"]["lead_qualification"]
            | null
          reason: string | null
          revenue: number | null
          sales_cycle_days: number | null
          service: string | null
          show_up: boolean | null
          source: string | null
          tags: string[] | null
          updated_at: string
          utm: string | null
        }
        Insert: {
          closed_on?: string | null
          closer_id?: string | null
          company?: string | null
          created_at?: string
          deal_size?: number | null
          first_call_date?: string | null
          ghl_contact_id?: string | null
          id?: string
          last_followup?: string | null
          name: string
          next_steps?: string | null
          pipeline_stage?: Database["public"]["Enums"]["lead_stage"]
          qualification?:
            | Database["public"]["Enums"]["lead_qualification"]
            | null
          reason?: string | null
          revenue?: number | null
          sales_cycle_days?: number | null
          service?: string | null
          show_up?: boolean | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
          utm?: string | null
        }
        Update: {
          closed_on?: string | null
          closer_id?: string | null
          company?: string | null
          created_at?: string
          deal_size?: number | null
          first_call_date?: string | null
          ghl_contact_id?: string | null
          id?: string
          last_followup?: string | null
          name?: string
          next_steps?: string | null
          pipeline_stage?: Database["public"]["Enums"]["lead_stage"]
          qualification?:
            | Database["public"]["Enums"]["lead_qualification"]
            | null
          reason?: string | null
          revenue?: number | null
          sales_cycle_days?: number | null
          service?: string | null
          show_up?: boolean | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
          utm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "closers"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          channel: string | null
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          review_notes: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["material_status"]
          submitted_by: string | null
          title: string
          type: Database["public"]["Enums"]["material_type"]
          updated_at: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          review_notes?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["material_status"]
          submitted_by?: string | null
          title: string
          type: Database["public"]["Enums"]["material_type"]
          updated_at?: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          review_notes?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["material_status"]
          submitted_by?: string | null
          title?: string
          type?: Database["public"]["Enums"]["material_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_revenue_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      utm_performance: {
        Row: {
          adset_name: string | null
          campaign_name: string | null
          created_at: string
          hot_rate: number | null
          id: string
          level: string
          month: string
          spend: number | null
          total_leads: number | null
          utm: string
          won_rate: number | null
        }
        Insert: {
          adset_name?: string | null
          campaign_name?: string | null
          created_at?: string
          hot_rate?: number | null
          id?: string
          level?: string
          month: string
          spend?: number | null
          total_leads?: number | null
          utm: string
          won_rate?: number | null
        }
        Update: {
          adset_name?: string | null
          campaign_name?: string | null
          created_at?: string
          hot_rate?: number | null
          id?: string
          level?: string
          month?: string
          spend?: number | null
          total_leads?: number | null
          utm?: string
          won_rate?: number | null
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
      app_role: "admin" | "closer" | "media_buyer" | "viewer"
      lead_qualification: "sql_qualified" | "mql" | "not_a_good_fit" | "na"
      lead_stage:
        | "cold_lead"
        | "general_lead"
        | "hot_lead"
        | "unpaid_invoice"
        | "opportunity_won"
        | "not_a_good_fit"
        | "no_show"
      material_status: "pending" | "approved" | "rejected"
      material_type: "image" | "text" | "video"
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
      app_role: ["admin", "closer", "media_buyer", "viewer"],
      lead_qualification: ["sql_qualified", "mql", "not_a_good_fit", "na"],
      lead_stage: [
        "cold_lead",
        "general_lead",
        "hot_lead",
        "unpaid_invoice",
        "opportunity_won",
        "not_a_good_fit",
        "no_show",
      ],
      material_status: ["pending", "approved", "rejected"],
      material_type: ["image", "text", "video"],
    },
  },
} as const
