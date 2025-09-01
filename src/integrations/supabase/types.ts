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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      conectividad: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      cultivos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      infraestructura_hidrica: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      instalaciones_agricultura: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      instalaciones_ganaderia: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
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
      propiedad_alambrados: {
        Row: {
          created_at: string | null
          id: string
          propiedad_id: string
          tipo_alambrado_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          propiedad_id: string
          tipo_alambrado_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          propiedad_id?: string
          tipo_alambrado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_alambrados_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_alambrados_tipo_alambrado_id_fkey"
            columns: ["tipo_alambrado_id"]
            isOneToOne: false
            referencedRelation: "tipos_alambrado"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedad_conectividad: {
        Row: {
          conectividad_id: string
          created_at: string | null
          id: string
          propiedad_id: string
        }
        Insert: {
          conectividad_id: string
          created_at?: string | null
          id?: string
          propiedad_id: string
        }
        Update: {
          conectividad_id?: string
          created_at?: string | null
          id?: string
          propiedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_conectividad_conectividad_id_fkey"
            columns: ["conectividad_id"]
            isOneToOne: false
            referencedRelation: "conectividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_conectividad_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedad_cultivos: {
        Row: {
          created_at: string | null
          cultivo_id: string
          id: string
          propiedad_id: string
        }
        Insert: {
          created_at?: string | null
          cultivo_id: string
          id?: string
          propiedad_id: string
        }
        Update: {
          created_at?: string | null
          cultivo_id?: string
          id?: string
          propiedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_cultivos_cultivo_id_fkey"
            columns: ["cultivo_id"]
            isOneToOne: false
            referencedRelation: "cultivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_cultivos_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
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
      propiedad_infraestructura_hidrica: {
        Row: {
          created_at: string | null
          id: string
          infraestructura_id: string
          propiedad_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          infraestructura_id: string
          propiedad_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          infraestructura_id?: string
          propiedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_infraestructura_hidrica_infraestructura_id_fkey"
            columns: ["infraestructura_id"]
            isOneToOne: false
            referencedRelation: "infraestructura_hidrica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_infraestructura_hidrica_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedad_instalaciones_agricultura: {
        Row: {
          created_at: string | null
          id: string
          instalacion_id: string
          propiedad_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          instalacion_id: string
          propiedad_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          instalacion_id?: string
          propiedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_instalaciones_agricultura_instalacion_id_fkey"
            columns: ["instalacion_id"]
            isOneToOne: false
            referencedRelation: "instalaciones_agricultura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_instalaciones_agricultura_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedad_instalaciones_ganaderia: {
        Row: {
          created_at: string | null
          id: string
          instalacion_id: string
          propiedad_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          instalacion_id: string
          propiedad_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          instalacion_id?: string
          propiedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_instalaciones_ganaderia_instalacion_id_fkey"
            columns: ["instalacion_id"]
            isOneToOne: false
            referencedRelation: "instalaciones_ganaderia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_instalaciones_ganaderia_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedad_servidumbres: {
        Row: {
          created_at: string | null
          id: string
          propiedad_id: string
          servidumbre_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          propiedad_id: string
          servidumbre_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          propiedad_id?: string
          servidumbre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedad_servidumbres_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedad_servidumbres_servidumbre_id_fkey"
            columns: ["servidumbre_id"]
            isOneToOne: false
            referencedRelation: "servidumbres"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedades: {
        Row: {
          acceso_agua: boolean | null
          agua_potable: string | null
          calidad_suelo: string | null
          cambio_cultivo: boolean | null
          cambio_cultivo_descripcion: string | null
          cantidad_hectareas: number
          cargas_afectaciones: string | null
          conectividad_vial: boolean | null
          conectividad_vial_descripcion: string | null
          created_at: string
          derechos_terceros: string | null
          descripcion: string | null
          distancia_acopio: number | null
          electricidad: string | null
          email_contacto: string | null
          energia_renovable: boolean | null
          foto_destacada: string | null
          gas: string | null
          hipoteca_gravamenes: boolean | null
          hipoteca_gravamenes_detalle: string | null
          id: string
          impuestos_al_dia: boolean | null
          indice_productividad: number | null
          indivision_hereditaria: boolean | null
          precio: number | null
          publicada: boolean
          regulaciones_ambientales: string | null
          restricciones_uso: string | null
          rocas_accidentes: string | null
          salinidad_suelo: number | null
          servicios: string[] | null
          sistema_riego: string | null
          telefono_codigo_pais: string | null
          telefono_numero: string | null
          tipo_campo: string
          titularidad_perfecta: boolean | null
          titulo: string
          ubicacion_id: string | null
          updated_at: string
          uso_actual: string | null
          usuario_id: string
          zonificacion: string | null
        }
        Insert: {
          acceso_agua?: boolean | null
          agua_potable?: string | null
          calidad_suelo?: string | null
          cambio_cultivo?: boolean | null
          cambio_cultivo_descripcion?: string | null
          cantidad_hectareas: number
          cargas_afectaciones?: string | null
          conectividad_vial?: boolean | null
          conectividad_vial_descripcion?: string | null
          created_at?: string
          derechos_terceros?: string | null
          descripcion?: string | null
          distancia_acopio?: number | null
          electricidad?: string | null
          email_contacto?: string | null
          energia_renovable?: boolean | null
          foto_destacada?: string | null
          gas?: string | null
          hipoteca_gravamenes?: boolean | null
          hipoteca_gravamenes_detalle?: string | null
          id?: string
          impuestos_al_dia?: boolean | null
          indice_productividad?: number | null
          indivision_hereditaria?: boolean | null
          precio?: number | null
          publicada?: boolean
          regulaciones_ambientales?: string | null
          restricciones_uso?: string | null
          rocas_accidentes?: string | null
          salinidad_suelo?: number | null
          servicios?: string[] | null
          sistema_riego?: string | null
          telefono_codigo_pais?: string | null
          telefono_numero?: string | null
          tipo_campo: string
          titularidad_perfecta?: boolean | null
          titulo: string
          ubicacion_id?: string | null
          updated_at?: string
          uso_actual?: string | null
          usuario_id: string
          zonificacion?: string | null
        }
        Update: {
          acceso_agua?: boolean | null
          agua_potable?: string | null
          calidad_suelo?: string | null
          cambio_cultivo?: boolean | null
          cambio_cultivo_descripcion?: string | null
          cantidad_hectareas?: number
          cargas_afectaciones?: string | null
          conectividad_vial?: boolean | null
          conectividad_vial_descripcion?: string | null
          created_at?: string
          derechos_terceros?: string | null
          descripcion?: string | null
          distancia_acopio?: number | null
          electricidad?: string | null
          email_contacto?: string | null
          energia_renovable?: boolean | null
          foto_destacada?: string | null
          gas?: string | null
          hipoteca_gravamenes?: boolean | null
          hipoteca_gravamenes_detalle?: string | null
          id?: string
          impuestos_al_dia?: boolean | null
          indice_productividad?: number | null
          indivision_hereditaria?: boolean | null
          precio?: number | null
          publicada?: boolean
          regulaciones_ambientales?: string | null
          restricciones_uso?: string | null
          rocas_accidentes?: string | null
          salinidad_suelo?: number | null
          servicios?: string[] | null
          sistema_riego?: string | null
          telefono_codigo_pais?: string | null
          telefono_numero?: string | null
          tipo_campo?: string
          titularidad_perfecta?: boolean | null
          titulo?: string
          ubicacion_id?: string | null
          updated_at?: string
          uso_actual?: string | null
          usuario_id?: string
          zonificacion?: string | null
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
      servidumbres: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
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
      tipos_alambrado: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
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
