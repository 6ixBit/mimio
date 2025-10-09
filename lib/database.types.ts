export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
          model: string;
          size: string;
          duration_seconds: number;
          is_active: boolean;
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
          model?: string;
          size?: string;
          duration_seconds?: number;
          is_active?: boolean;
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
          model?: string;
          size?: string;
          duration_seconds?: number;
          is_active?: boolean;
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
      social_media_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          platform_user_id: string;
          username: string;
          display_name: string | null;
          profile_picture_url: string | null;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          connection_status: string | null;
          is_active: boolean;
          error_message: string | null;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          platform_user_id: string;
          username: string;
          display_name?: string | null;
          profile_picture_url?: string | null;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          connection_status?: string | null;
          is_active?: boolean;
          error_message?: string | null;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          platform_user_id?: string;
          username?: string;
          display_name?: string | null;
          profile_picture_url?: string | null;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          connection_status?: string | null;
          is_active?: boolean;
          error_message?: string | null;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_posts: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          social_media_account_id: string;
          platform: string;
          caption: string | null;
          status: string | null;
          platform_post_id: string | null;
          post_url: string | null;
          error_message: string | null;
          posted_at: string | null;
          views_count: number | null;
          likes_count: number | null;
          comments_count: number | null;
          shares_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          social_media_account_id: string;
          platform: string;
          caption?: string | null;
          status?: string | null;
          platform_post_id?: string | null;
          post_url?: string | null;
          error_message?: string | null;
          posted_at?: string | null;
          views_count?: number | null;
          likes_count?: number | null;
          comments_count?: number | null;
          shares_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          social_media_account_id?: string;
          platform?: string;
          caption?: string | null;
          status?: string | null;
          platform_post_id?: string | null;
          post_url?: string | null;
          error_message?: string | null;
          posted_at?: string | null;
          views_count?: number | null;
          likes_count?: number | null;
          comments_count?: number | null;
          shares_count?: number | null;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
          model: string;
          size: string;
          duration_seconds: number;
          is_active: boolean;
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
          model?: string;
          size?: string;
          duration_seconds?: number;
          is_active?: boolean;
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
          model?: string;
          size?: string;
          duration_seconds?: number;
          is_active?: boolean;
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
      social_media_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          platform_user_id: string;
          username: string;
          display_name: string | null;
          profile_picture_url: string | null;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          connection_status: string | null;
          is_active: boolean;
          error_message: string | null;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          platform_user_id: string;
          username: string;
          display_name?: string | null;
          profile_picture_url?: string | null;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          connection_status?: string | null;
          is_active?: boolean;
          error_message?: string | null;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          platform_user_id?: string;
          username?: string;
          display_name?: string | null;
          profile_picture_url?: string | null;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          connection_status?: string | null;
          is_active?: boolean;
          error_message?: string | null;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_posts: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          social_media_account_id: string;
          platform: string;
          caption: string | null;
          status: string | null;
          platform_post_id: string | null;
          post_url: string | null;
          error_message: string | null;
          posted_at: string | null;
          views_count: number | null;
          likes_count: number | null;
          comments_count: number | null;
          shares_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          social_media_account_id: string;
          platform: string;
          caption?: string | null;
          status?: string | null;
          platform_post_id?: string | null;
          post_url?: string | null;
          error_message?: string | null;
          posted_at?: string | null;
          views_count?: number | null;
          likes_count?: number | null;
          comments_count?: number | null;
          shares_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          social_media_account_id?: string;
          platform?: string;
          caption?: string | null;
          status?: string | null;
          platform_post_id?: string | null;
          post_url?: string | null;
          error_message?: string | null;
          posted_at?: string | null;
          views_count?: number | null;
          likes_count?: number | null;
          comments_count?: number | null;
          shares_count?: number | null;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
