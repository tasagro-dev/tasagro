export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          tipo_usuario: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          tipo_usuario?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          tipo_usuario?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propiedad_imagenes: {
        Row: {
          created_at: string
          es_destacada: boolean
          id: string
          imagen_url: string
          orden: number | null
          propiedad_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          es_destacada?: boolean
          id?: string
          imagen_url: string
          orden?: number | null
          propiedad_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          es_destacada?: boolean
          id?: string
          imagen_url?: string
          orden?: number | null
          propiedad_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_imagenes_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedades: {
        Row: {
          cantidad_hectareas: number
          created_at: string
          descripcion: string | null
          foto_destacada: string | null
          id: string
          precio: number | null
          publicada: boolean
          servicios: string[] | null
          tipo_campo: string
          titulo: string
          ubicacion_id: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          cantidad_hectareas: number
          created_at?: string
          descripcion?: string | null
          foto_destacada?: string | null
          id?: string
          precio?: number | null
          publicada?: boolean
          servicios?: string[] | null
          tipo_campo: string
          titulo: string
          ubicacion_id?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          cantidad_hectareas?: number
          created_at?: string
          descripcion?: string | null
          foto_destacada?: string | null
          id?: string
          precio?: number | null
          publicada?: boolean
          servicios?: string[] | null
          tipo_campo?: string
          titulo?: string
          ubicacion_id?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedades_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      tasaciones: {
        Row: {
          accesibilidad: string
          coordenadas: string | null
          created_at: string
          hectareas: number
          id: string
          imagenes: string[] | null
          localidad: string
          mejoras: string[] | null
          nombre_propiedad: string | null
          partido: string
          provincia: string
          servicios: string[] | null
          tipo_campo: string
          tipo_suelo: string | null
          updated_at: string
          user_id: string
          valor_estimado: number | null
        }
        Insert: {
          accesibilidad: string
          coordenadas?: string | null
          created_at?: string
          hectareas: number
          id?: string
          imagenes?: string[] | null
          localidad: string
          mejoras?: string[] | null
          nombre_propiedad?: string | null
          partido: string
          provincia: string
          servicios?: string[] | null
          tipo_campo: string
          tipo_suelo?: string | null
          updated_at?: string
          user_id: string
          valor_estimado?: number | null
        }
        Update: {
          accesibilidad?: string
          coordenadas?: string | null
          created_at?: string
          hectareas?: number
          id?: string
          imagenes?: string[] | null
          localidad?: string
          mejoras?: string[] | null
          nombre_propiedad?: string | null
          partido?: string
          provincia?: string
          servicios?: string[] | null
          tipo_campo?: string
          tipo_suelo?: string | null
          updated_at?: string
          user_id?: string
          valor_estimado?: number | null
        }
        Relationships: []
      }
      ubicaciones: {
        Row: {
          created_at: string
          id: string
          localidad: string
          provincia: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          localidad: string
          provincia: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          localidad?: string
          provincia?: string
          updated_at?: string
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
