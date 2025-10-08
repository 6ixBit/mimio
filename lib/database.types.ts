/**
 * Database Types
 * TypeScript types for Supabase tables
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          system_prompt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          system_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          system_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ad_templates: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          original_video_url: string;
          video_type: string;
          video_prompt: string;
          thumbnail_url: string | null;
          duration: string | null;
          model: string | null;
          size: string | null;
          seconds: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          original_video_url: string;
          video_type: string;
          video_prompt: string;
          thumbnail_url?: string | null;
          duration?: string | null;
          model?: string | null;
          size?: string | null;
          seconds?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          original_video_url?: string;
          video_type?: string;
          video_prompt?: string;
          thumbnail_url?: string | null;
          duration?: string | null;
          model?: string | null;
          size?: string | null;
          seconds?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          template_id: string | null;
          title: string;
          video_url: string;
          thumbnail_url: string | null;
          prompt: string;
          model: string;
          size: string;
          duration_seconds: number | null;
          status: string | null;
          views: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          template_id?: string | null;
          title: string;
          video_url: string;
          thumbnail_url?: string | null;
          prompt: string;
          model: string;
          size: string;
          duration_seconds?: number | null;
          status?: string | null;
          views?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          template_id?: string | null;
          title?: string;
          video_url?: string;
          thumbnail_url?: string | null;
          prompt?: string;
          model?: string;
          size?: string;
          duration_seconds?: number | null;
          status?: string | null;
          views?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier use
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type AdTemplate = Database["public"]["Tables"]["ad_templates"]["Row"];
export type AdTemplateInsert =
  Database["public"]["Tables"]["ad_templates"]["Insert"];
export type AdTemplateUpdate =
  Database["public"]["Tables"]["ad_templates"]["Update"];

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type VideoInsert = Database["public"]["Tables"]["videos"]["Insert"];
export type VideoUpdate = Database["public"]["Tables"]["videos"]["Update"];

// Video type enum
export type VideoType =
  | "POV"
  | "Review"
  | "Unboxing"
  | "Tutorial"
  | "Showcase"
  | "Demo";

// Video status enum
export type VideoStatus = "processing" | "completed" | "failed";

