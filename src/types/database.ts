export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          school: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          school?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          school?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          year_level: string
          subject: string
          curriculum_code: string
          resource_type: string
          visual_style: string
          status: string
          thumbnail_url: string | null
          folder_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          year_level: string
          subject: string
          curriculum_code: string
          resource_type: string
          visual_style: string
          status?: string
          thumbnail_url?: string | null
          folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          year_level?: string
          subject?: string
          curriculum_code?: string
          resource_type?: string
          visual_style?: string
          status?: string
          thumbnail_url?: string | null
          folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      slides: {
        Row: {
          id: string
          project_id: string
          position: number
          title: string
          slide_type: string
          content: Json
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          position: number
          title: string
          slide_type: string
          content?: Json
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          position?: number
          title?: string
          slide_type?: string
          content?: Json
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          project_id: string
          resource_type: string
          content: Json
          image_url: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          resource_type: string
          content?: Json
          image_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          resource_type?: string
          content?: Json
          image_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          id: string
          project_id: string | null
          user_id: string | null
          task: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          cost_usd: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          task: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          cost_usd?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          task?: string
          model?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          cost_usd?: number | null
          created_at?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
