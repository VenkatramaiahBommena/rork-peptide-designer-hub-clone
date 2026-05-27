/* eslint-disable */
// AUTO-GENERATED — DO NOT EDIT
// Run migrations to regenerate.

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
      activity_log: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          target_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          target_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          target_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      datasets: {
        Row: {
          created_at: string
          dataset_name: string
          description: string | null
          file_format: string | null
          id: string
          is_public: boolean
          metadata: Json | null
          peptide_count: number
          storage_path: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_name: string
          description?: string | null
          file_format?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json | null
          peptide_count?: number
          storage_path?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_name?: string
          description?: string | null
          file_format?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json | null
          peptide_count?: number
          storage_path?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      docking_results: {
        Row: {
          binding_pose_rank: number | null
          created_at: string
          docking_algorithm: string | null
          electrostatic: number | null
          hydrogen_bonds: number | null
          hydrophobic_contacts: number | null
          id: string
          parameters: Json | null
          peptide_id: string | null
          receptor_name: string
          receptor_pdb_id: string | null
          rmsd: number | null
          salt_bridges: number | null
          total_score: number
          user_id: string
          van_der_waals: number | null
        }
        Insert: {
          binding_pose_rank?: number | null
          created_at?: string
          docking_algorithm?: string | null
          electrostatic?: number | null
          hydrogen_bonds?: number | null
          hydrophobic_contacts?: number | null
          id?: string
          parameters?: Json | null
          peptide_id?: string | null
          receptor_name: string
          receptor_pdb_id?: string | null
          rmsd?: number | null
          salt_bridges?: number | null
          total_score?: number
          user_id: string
          van_der_waals?: number | null
        }
        Update: {
          binding_pose_rank?: number | null
          created_at?: string
          docking_algorithm?: string | null
          electrostatic?: number | null
          hydrogen_bonds?: number | null
          hydrophobic_contacts?: number | null
          id?: string
          parameters?: Json | null
          peptide_id?: string | null
          receptor_name?: string
          receptor_pdb_id?: string | null
          rmsd?: number | null
          salt_bridges?: number | null
          total_score?: number
          user_id?: string
          van_der_waals?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "docking_results_peptide_id_fkey"
            columns: ["peptide_id"]
            isOneToOne: false
            referencedRelation: "peptides"
            referencedColumns: ["id"]
          },
        ]
      }
      peptide_versions: {
        Row: {
          binding_affinity: number
          change_description: string | null
          created_at: string
          docking_score: number
          id: string
          membrane_permeability: number
          peptide_id: string
          sequence: string
          solubility: number
          specificity: number
          stability: number
          unnatural_count: number
          version: number
        }
        Insert: {
          binding_affinity?: number
          change_description?: string | null
          created_at?: string
          docking_score?: number
          id?: string
          membrane_permeability?: number
          peptide_id: string
          sequence: string
          solubility?: number
          specificity?: number
          stability?: number
          unnatural_count?: number
          version: number
        }
        Update: {
          binding_affinity?: number
          change_description?: string | null
          created_at?: string
          docking_score?: number
          id?: string
          membrane_permeability?: number
          peptide_id?: string
          sequence?: string
          solubility?: number
          specificity?: number
          stability?: number
          unnatural_count?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "peptide_versions_peptide_id_fkey"
            columns: ["peptide_id"]
            isOneToOne: false
            referencedRelation: "peptides"
            referencedColumns: ["id"]
          },
        ]
      }
      peptides: {
        Row: {
          binding_affinity: number
          created_at: string
          docking_score: number
          hydrophobicity: number | null
          id: string
          isoelectric_point: number | null
          membrane_permeability: number
          metadata: Json | null
          molecular_weight: number | null
          net_charge: number | null
          parent_id: string | null
          peptide_name: string | null
          project_id: string | null
          search_vector: unknown
          sequence: string
          sequence_length: number
          smiles_notation: string | null
          solubility: number
          specificity: number
          stability: number
          status: string | null
          tags: string[] | null
          target_id: string
          target_name: string | null
          unnatural_count: number
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          binding_affinity?: number
          created_at?: string
          docking_score?: number
          hydrophobicity?: number | null
          id?: string
          isoelectric_point?: number | null
          membrane_permeability?: number
          metadata?: Json | null
          molecular_weight?: number | null
          net_charge?: number | null
          parent_id?: string | null
          peptide_name?: string | null
          project_id?: string | null
          search_vector?: unknown
          sequence: string
          sequence_length: number
          smiles_notation?: string | null
          solubility?: number
          specificity?: number
          stability?: number
          status?: string | null
          tags?: string[] | null
          target_id: string
          target_name?: string | null
          unnatural_count?: number
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          binding_affinity?: number
          created_at?: string
          docking_score?: number
          hydrophobicity?: number | null
          id?: string
          isoelectric_point?: number | null
          membrane_permeability?: number
          metadata?: Json | null
          molecular_weight?: number | null
          net_charge?: number | null
          parent_id?: string | null
          peptide_name?: string | null
          project_id?: string | null
          search_vector?: unknown
          sequence?: string
          sequence_length?: number
          smiles_notation?: string | null
          solubility?: number
          specificity?: number
          stability?: number
          status?: string | null
          tags?: string[] | null
          target_id?: string
          target_name?: string | null
          unnatural_count?: number
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "peptides_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "peptides"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          peptide_count: number
          project_name: string
          status: string | null
          target_id: string | null
          target_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          peptide_count?: number
          project_name: string
          status?: string | null
          target_id?: string | null
          target_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          peptide_count?: number
          project_name?: string
          status?: string | null
          target_id?: string | null
          target_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          permissions: Json | null
          rate_limit: number | null
          scopes: string[] | null
          token_hash: string
          token_name: string
          token_prefix: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit?: number | null
          scopes?: string[] | null
          token_hash: string
          token_name: string
          token_prefix: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit?: number | null
          scopes?: string[] | null
          token_hash?: string
          token_name?: string
          token_prefix?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          institution: string | null
          qualification: string | null
          research_area: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          institution?: string | null
          qualification?: string | null
          research_area?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          institution?: string | null
          qualification?: string | null
          research_area?: string | null
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
      search_peptides: {
        Args: { search_query: string; user_id_filter?: string }
        Returns: {
          docking_score: number
          id: string
          peptide_name: string
          rank: number
          sequence: string
          target_id: string
          target_name: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      user_id: { Args: never; Returns: string }
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
