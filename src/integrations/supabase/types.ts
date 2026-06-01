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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          appointment_date: string
          appointment_time: string
          booking_number: string
          created_at: string
          doctor_id: string | null
          doctor_name: string | null
          family_member_id: string | null
          id: string
          notes: string | null
          patient_age: number | null
          patient_gender: Database["public"]["Enums"]["gender_type"] | null
          patient_name: string
          patient_phone: string
          provider_id: string
          provider_name: string
          provider_type: string | null
          service_name: string | null
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          booking_number?: string
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string | null
          family_member_id?: string | null
          id?: string
          notes?: string | null
          patient_age?: number | null
          patient_gender?: Database["public"]["Enums"]["gender_type"] | null
          patient_name: string
          patient_phone: string
          provider_id: string
          provider_name: string
          provider_type?: string | null
          service_name?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          booking_number?: string
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string | null
          family_member_id?: string | null
          id?: string
          notes?: string | null
          patient_age?: number | null
          patient_gender?: Database["public"]["Enums"]["gender_type"] | null
          patient_name?: string
          patient_phone?: string
          provider_id?: string
          provider_name?: string
          provider_type?: string | null
          service_name?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          age: number | null
          created_at: string
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          phone: string | null
          relation: Database["public"]["Enums"]["family_relation"]
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          phone?: string | null
          relation: Database["public"]["Enums"]["family_relation"]
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          phone?: string | null
          relation?: Database["public"]["Enums"]["family_relation"]
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["favorite_kind"]
          target_id: string
          target_meta: Json | null
          target_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["favorite_kind"]
          target_id: string
          target_meta?: Json | null
          target_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["favorite_kind"]
          target_id?: string
          target_meta?: Json | null
          target_name?: string
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          attachments: Json | null
          created_at: string
          description: string | null
          doctor_name: string | null
          family_member_id: string | null
          id: string
          provider_name: string | null
          record_date: string
          record_type: Database["public"]["Enums"]["record_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          family_member_id?: string | null
          id?: string
          provider_name?: string | null
          record_date?: string
          record_type?: Database["public"]["Enums"]["record_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          family_member_id?: string | null
          id?: string
          provider_name?: string | null
          record_date?: string
          record_type?: Database["public"]["Enums"]["record_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      family_relation:
        | "father"
        | "mother"
        | "spouse"
        | "child"
        | "sibling"
        | "other"
      favorite_kind: "provider" | "doctor"
      gender_type: "male" | "female"
      record_type:
        | "prescription"
        | "lab_result"
        | "radiology"
        | "diagnosis"
        | "vaccination"
        | "other"
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
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      family_relation: [
        "father",
        "mother",
        "spouse",
        "child",
        "sibling",
        "other",
      ],
      favorite_kind: ["provider", "doctor"],
      gender_type: ["male", "female"],
      record_type: [
        "prescription",
        "lab_result",
        "radiology",
        "diagnosis",
        "vaccination",
        "other",
      ],
    },
  },
} as const
