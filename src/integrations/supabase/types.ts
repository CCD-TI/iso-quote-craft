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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advisors: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attached_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean
          mime_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean
          mime_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean
          mime_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          cci: string | null
          created_at: string
          currency: string
          id: string
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          cci?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          cci?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certification_steps: {
        Row: {
          created_at: string
          id: string
          step_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          step_order: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          step_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      iso_standards: {
        Row: {
          certification_price: number
          code: string
          created_at: string
          description: string | null
          follow_up_price: number
          id: string
          name: string
          recertification_price: number
          updated_at: string
        }
        Insert: {
          certification_price?: number
          code: string
          created_at?: string
          description?: string | null
          follow_up_price?: number
          id?: string
          name: string
          recertification_price?: number
          updated_at?: string
        }
        Update: {
          certification_price?: number
          code?: string
          created_at?: string
          description?: string | null
          follow_up_price?: number
          id?: string
          name?: string
          recertification_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      quotation_isos: {
        Row: {
          certification: boolean
          certification_price: number
          created_at: string
          follow_up: boolean
          follow_up_price: number
          id: string
          iso_id: string
          quotation_id: string
          recertification: boolean
          recertification_price: number
        }
        Insert: {
          certification?: boolean
          certification_price?: number
          created_at?: string
          follow_up?: boolean
          follow_up_price?: number
          id?: string
          iso_id: string
          quotation_id: string
          recertification?: boolean
          recertification_price?: number
        }
        Update: {
          certification?: boolean
          certification_price?: number
          created_at?: string
          follow_up?: boolean
          follow_up_price?: number
          id?: string
          iso_id?: string
          quotation_id?: string
          recertification?: boolean
          recertification_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_isos_iso_id_fkey"
            columns: ["iso_id"]
            isOneToOne: false
            referencedRelation: "iso_standards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_isos_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          advisor_id: string | null
          client_celular: string | null
          client_correo: string | null
          client_razon_social: string | null
          client_representante: string | null
          client_ruc: string | null
          code: string
          created_at: string
          date: string
          discount: number
          id: string
          igv: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          advisor_id?: string | null
          client_celular?: string | null
          client_correo?: string | null
          client_razon_social?: string | null
          client_representante?: string | null
          client_ruc?: string | null
          code: string
          created_at?: string
          date?: string
          discount?: number
          id?: string
          igv?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          advisor_id?: string | null
          client_celular?: string | null
          client_correo?: string | null
          client_razon_social?: string | null
          client_representante?: string | null
          client_ruc?: string | null
          code?: string
          created_at?: string
          date?: string
          discount?: number
          id?: string
          igv?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
