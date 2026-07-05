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
      access_tokens: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          kind: Database["public"]["Enums"]["token_kind"]
          label: string | null
          last_used_at: string | null
          provider_id: string | null
          reception_user_id: string | null
          token: string
          uses_count: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["token_kind"]
          label?: string | null
          last_used_at?: string | null
          provider_id?: string | null
          reception_user_id?: string | null
          token: string
          uses_count?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["token_kind"]
          label?: string | null
          last_used_at?: string | null
          provider_id?: string | null
          reception_user_id?: string | null
          token?: string
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "access_tokens_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_tokens_reception_fk"
            columns: ["reception_user_id"]
            isOneToOne: false
            referencedRelation: "reception_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          link_url: string | null
          placement: string
          priority: number
          provider_id: string | null
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          placement?: string
          priority?: number
          provider_id?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          placement?: string
          priority?: number
          provider_id?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          meta: Json
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          meta?: Json
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          meta?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
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
      cities: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name_ar: string
          name_en: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name_ar: string
          name_en: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          author: string | null
          body: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          image_url: string | null
          kind: string
          published: boolean
          published_at: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          kind?: string
          published?: boolean
          published_at?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          kind?: string
          published?: boolean
          published_at?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      featured_content: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          link_url: string | null
          rank: number
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          rank?: number
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          rank?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
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
      home_sections: {
        Row: {
          config: Json
          created_at: string
          ends_at: string | null
          id: string
          key: string
          section_type: string
          sort_order: number
          starts_at: string | null
          title_ar: string
          title_en: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          config?: Json
          created_at?: string
          ends_at?: string | null
          id?: string
          key: string
          section_type?: string
          sort_order?: number
          starts_at?: string | null
          title_ar: string
          title_en?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          config?: Json
          created_at?: string
          ends_at?: string | null
          id?: string
          key?: string
          section_type?: string
          sort_order?: number
          starts_at?: string | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          approved: boolean
          code: string | null
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          ends_at: string | null
          id: string
          image_url: string | null
          kind: string
          provider_id: string | null
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          approved?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          provider_id?: string | null
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          approved?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          provider_id?: string | null
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          active: boolean
          ads_limit: number
          code: string
          created_at: string
          features: Json
          id: string
          max_doctors: number
          max_reception: number
          max_staff: number
          name_ar: string
          name_en: string | null
          notif_limit: number
          offers_limit: number
          permissions: Json
          price_monthly: number
          price_yearly: number
          sort_order: number
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          ads_limit?: number
          code: string
          created_at?: string
          features?: Json
          id?: string
          max_doctors?: number
          max_reception?: number
          max_staff?: number
          name_ar: string
          name_en?: string | null
          notif_limit?: number
          offers_limit?: number
          permissions?: Json
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          ads_limit?: number
          code?: string
          created_at?: string
          features?: Json
          id?: string
          max_doctors?: number
          max_reception?: number
          max_staff?: number
          name_ar?: string
          name_en?: string | null
          notif_limit?: number
          offers_limit?: number
          permissions?: Json
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          kind: string
          method: string | null
          notes: string | null
          provider_id: string | null
          reference: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          method?: string | null
          notes?: string | null
          provider_id?: string | null
          reference?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          method?: string | null
          notes?: string | null
          provider_id?: string | null
          reference?: string | null
          status?: string
          user_id?: string | null
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
      providers: {
        Row: {
          address: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          featured_rank: number | null
          gallery_urls: string[]
          id: string
          image_url: string | null
          logo_url: string | null
          must_change_password: boolean
          name: string
          owner_user_id: string | null
          package_id: string | null
          phone: string | null
          rating: number | null
          reviews_count: number | null
          status: Database["public"]["Enums"]["provider_status"]
          subscription_status: string
          type: Database["public"]["Enums"]["provider_type"]
          updated_at: string
          username: string | null
          verified: boolean
        }
        Insert: {
          address?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_rank?: number | null
          gallery_urls?: string[]
          id?: string
          image_url?: string | null
          logo_url?: string | null
          must_change_password?: boolean
          name: string
          owner_user_id?: string | null
          package_id?: string | null
          phone?: string | null
          rating?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["provider_status"]
          subscription_status?: string
          type: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
          username?: string | null
          verified?: boolean
        }
        Update: {
          address?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_rank?: number | null
          gallery_urls?: string[]
          id?: string
          image_url?: string | null
          logo_url?: string | null
          must_change_password?: boolean
          name?: string
          owner_user_id?: string | null
          package_id?: string | null
          phone?: string | null
          rating?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["provider_status"]
          subscription_status?: string
          type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
          username?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "providers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      reception_users: {
        Row: {
          active: boolean
          created_at: string
          employee_name: string | null
          full_name: string
          id: string
          permissions: Json
          phone: string | null
          photo_url: string | null
          provider_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          employee_name?: string | null
          full_name: string
          id?: string
          permissions?: Json
          phone?: string | null
          photo_url?: string | null
          provider_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          employee_name?: string | null
          full_name?: string
          id?: string
          permissions?: Json
          phone?: string | null
          photo_url?: string | null
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reception_users_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
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
      specialties: {
        Row: {
          active: boolean
          created_at: string
          icon: string | null
          id: string
          kind: string
          name_ar: string
          name_en: string | null
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          kind?: string
          name_ar: string
          name_en?: string | null
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          kind?: string
          name_ar?: string
          name_en?: string | null
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "specialties_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean
          created_at: string
          cycle: string
          ends_at: string | null
          id: string
          notes: string | null
          package_id: string
          provider_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          auto_renew?: boolean
          created_at?: string
          cycle?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          package_id: string
          provider_id: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean
          created_at?: string
          cycle?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          package_id?: string
          provider_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assignee: string | null
          created_at: string
          id: string
          kind: string
          message: string | null
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assignee?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
      verification_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          document_url: string | null
          full_name: string
          id: string
          id_number: string | null
          note: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          document_url?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          note?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          document_url?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          note?: string | null
          status?: string
          updated_at?: string
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
      app_role: "admin" | "provider" | "patient"
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
      provider_status: "active" | "pending" | "suspended"
      provider_type: "hospital" | "clinic" | "lab" | "radiology" | "pharmacy"
      record_type:
        | "prescription"
        | "lab_result"
        | "radiology"
        | "diagnosis"
        | "vaccination"
        | "other"
      token_kind: "admin" | "provider" | "reception"
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
      app_role: ["admin", "provider", "patient"],
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
      provider_status: ["active", "pending", "suspended"],
      provider_type: ["hospital", "clinic", "lab", "radiology", "pharmacy"],
      record_type: [
        "prescription",
        "lab_result",
        "radiology",
        "diagnosis",
        "vaccination",
        "other",
      ],
      token_kind: ["admin", "provider", "reception"],
    },
  },
} as const
