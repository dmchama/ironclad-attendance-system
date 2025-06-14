export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string
          date: string
          duration: number | null
          gym_id: string | null
          id: string
          member_id: string
        }
        Insert: {
          check_in: string
          check_out?: string | null
          created_at?: string
          date?: string
          duration?: number | null
          gym_id?: string | null
          id?: string
          member_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          date?: string
          duration?: number | null
          gym_id?: string | null
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          admin_email: string | null
          admin_name: string | null
          created_at: string
          email: string
          gym_qr_code: string
          id: string
          name: string
          owner_id: string | null
          password_hash: string | null
          phone: string | null
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          admin_email?: string | null
          admin_name?: string | null
          created_at?: string
          email: string
          gym_qr_code: string
          id?: string
          name: string
          owner_id?: string | null
          password_hash?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          admin_email?: string | null
          admin_name?: string | null
          created_at?: string
          email?: string
          gym_qr_code?: string
          id?: string
          name?: string
          owner_id?: string | null
          password_hash?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          barcode: string | null
          created_at: string
          email: string
          emergency_contact: string | null
          gym_id: string | null
          id: string
          join_date: string
          membership_end_date: string | null
          membership_plan_id: string | null
          membership_start_date: string | null
          membership_type: string
          name: string
          password_hash: string | null
          phone: string
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          email: string
          emergency_contact?: string | null
          gym_id?: string | null
          id?: string
          join_date?: string
          membership_end_date?: string | null
          membership_plan_id?: string | null
          membership_start_date?: string | null
          membership_type: string
          name: string
          password_hash?: string | null
          phone: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          barcode?: string | null
          created_at?: string
          email?: string
          emergency_contact?: string | null
          gym_id?: string | null
          id?: string
          join_date?: string
          membership_end_date?: string | null
          membership_plan_id?: string | null
          membership_start_date?: string | null
          membership_type?: string
          name?: string
          password_hash?: string | null
          phone?: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          duration_days: number
          gym_id: string
          id: string
          is_active: boolean | null
          plan_name: string
          plan_type: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          gym_id: string
          id?: string
          is_active?: boolean | null
          plan_name: string
          plan_type: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          gym_id?: string
          id?: string
          is_active?: boolean | null
          plan_name?: string
          plan_type?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          gym_id: string | null
          id: string
          member_id: string
          membership_plan_id: string | null
          membership_type: string
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          gym_id?: string | null
          id?: string
          member_id: string
          membership_plan_id?: string | null
          membership_type: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          gym_id?: string | null
          id?: string
          member_id?: string
          membership_plan_id?: string | null
          membership_type?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_gym_admin: {
        Args: { input_username: string; input_password: string }
        Returns: {
          gym_id: string
          gym_name: string
          is_authenticated: boolean
        }[]
      }
      authenticate_member: {
        Args: { input_username: string; input_password: string }
        Returns: {
          member_id: string
          member_name: string
          gym_id: string
          is_authenticated: boolean
        }[]
      }
      generate_gym_qr_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      member_checkin_with_qr: {
        Args: { member_id: string; gym_qr_code: string }
        Returns: {
          success: boolean
          message: string
          gym_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
