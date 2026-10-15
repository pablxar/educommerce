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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      accesos: {
        Row: {
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: []
      }
      checkout_leads: {
        Row: {
          amount: number | null
          attribution: Json
          created_at: string
          email: string
          id: string
          name: string
          order_id: string | null
          product_id: string
          product_name: string | null
          stage: string
          sync_revision: string
          synced_at: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          attribution?: Json
          created_at?: string
          email: string
          id: string
          name?: string
          order_id?: string | null
          product_id: string
          product_name?: string | null
          stage?: string
          sync_revision?: string
          synced_at?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          attribution?: Json
          created_at?: string
          email?: string
          id?: string
          name?: string
          order_id?: string | null
          product_id?: string
          product_name?: string | null
          stage?: string
          sync_revision?: string
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      lista_espera: {
        Row: {
          correo: string
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          correo: string
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          correo?: string
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      newsletter_name_receipts: {
        Row: {
          created_at: string
          subscriber_id: string
          token: string
        }
        Insert: {
          created_at?: string
          subscriber_id: string
          token?: string
        }
        Update: {
          created_at?: string
          subscriber_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_name_receipts_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string
          sync_revision: string
          synced_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string
          sync_revision?: string
          synced_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string
          sync_revision?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          attribution: Json
          campus_synced_at: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          discount_code: string | null
          discount_percent: number | null
          email: string
          id: string
          list_amount: number | null
          module_ids: string[]
          mp_coupon_amount: number | null
          mp_payment_id: string | null
          mp_preference_id: string | null
          name: string
          paid_at: string | null
          product_id: string
          product_kind: string | null
          product_name: string | null
          product_title: string
          status: string
        }
        Insert: {
          amount: number
          attribution?: Json
          campus_synced_at?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          discount_code?: string | null
          discount_percent?: number | null
          email: string
          id?: string
          list_amount?: number | null
          module_ids?: string[]
          mp_coupon_amount?: number | null
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          name?: string
          paid_at?: string | null
          product_id: string
          product_kind?: string | null
          product_name?: string | null
          product_title: string
          status?: string
        }
        Update: {
          amount?: number
          attribution?: Json
          campus_synced_at?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          discount_code?: string | null
          discount_percent?: number | null
          email?: string
          id?: string
          list_amount?: number | null
          module_ids?: string[]
          mp_coupon_amount?: number | null
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          name?: string
          paid_at?: string | null
          product_id?: string
          product_kind?: string | null
          product_name?: string | null
          product_title?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apellido: string
          correo: string
          created_at: string
          id: string
          nombre: string
          pais: string
        }
        Insert: {
          apellido?: string
          correo?: string
          created_at?: string
          id: string
          nombre?: string
          pais?: string
        }
        Update: {
          apellido?: string
          correo?: string
          created_at?: string
          id?: string
          nombre?: string
          pais?: string
        }
        Relationships: []
      }
      progreso: {
        Row: {
          capsula: number
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          capsula: number
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          capsula?: number
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "alumno"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "alumno"],
    },
  },
} as const
