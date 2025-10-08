/**
 * Supabase Client Configuration
 *
 * NOTE: TypeScript errors in this file will resolve after:
 * 1. Setting up your Supabase project
 * 2. Running the migration (001_initial_schema.sql)
 * 3. Adding environment variables to .env.local
 *
 * The errors occur because the Database types reference tables
 * that don't exist until the migration is run.
 */

import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file"
  );
}

// @ts-ignore - Type errors will resolve after Supabase setup
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries

/**
 * Projects
 */
export const projectsApi = {
  // Get all projects for the current user
  getAll: async (userId: string) => {
    return await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  // Get a single project
  getById: async (id: string) => {
    return await supabase.from("projects").select("*").eq("id", id).single();
  },

  // Create a new project
  create: async (
    userId: string,
    data: { name: string; description?: string; system_prompt?: string }
  ) => {
    return await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description || null,
        system_prompt: data.system_prompt || null,
      })
      .select()
      .single();
  },

  // Update a project
  update: async (
    id: string,
    data: { name?: string; description?: string; system_prompt?: string }
  ) => {
    return await supabase
      .from("projects")
      .update({
        name: data.name,
        description: data.description,
        system_prompt: data.system_prompt,
      })
      .eq("id", id)
      .select()
      .single();
  },

  // Delete a project
  delete: async (id: string) => {
    return await supabase.from("projects").delete().eq("id", id);
  },
};

/**
 * Ad Templates
 */
export const templatesApi = {
  // Get all active templates
  getAll: async () => {
    return await supabase
      .from("ad_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
  },

  // Get templates by type
  getByType: async (videoType: string) => {
    return await supabase
      .from("ad_templates")
      .select("*")
      .eq("is_active", true)
      .eq("video_type", videoType)
      .order("created_at", { ascending: false });
  },

  // Get a single template
  getById: async (id: string) => {
    return await supabase
      .from("ad_templates")
      .select("*")
      .eq("id", id)
      .single();
  },

  // Get videos generated from a template (for showcase)
  getGeneratedVideos: async (templateId: string, limit: number = 10) => {
    return await supabase
      .from("videos")
      .select("*")
      .eq("template_id", templateId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(limit);
  },
};

/**
 * Videos
 */
export const videosApi = {
  // Get all videos for the current user
  getAll: async (userId: string) => {
    return await supabase
      .from("videos")
      .select("*, project:projects(*), template:ad_templates(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  // Get videos by project
  getByProject: async (projectId: string) => {
    return await supabase
      .from("videos")
      .select("*, template:ad_templates(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
  },

  // Get a single video
  getById: async (id: string) => {
    return await supabase
      .from("videos")
      .select("*, project:projects(*), template:ad_templates(*)")
      .eq("id", id)
      .single();
  },

  // Create a new video
  create: async (
    userId: string,
    data: {
      title: string;
      video_url: string;
      prompt: string;
      model: string;
      size: string;
      project_id?: string;
      template_id?: string;
      thumbnail_url?: string;
      duration_seconds?: number;
    }
  ) => {
    return await supabase
      .from("videos")
      .insert({
        user_id: userId,
        title: data.title,
        video_url: data.video_url,
        prompt: data.prompt,
        model: data.model,
        size: data.size,
        project_id: data.project_id || null,
        template_id: data.template_id || null,
        thumbnail_url: data.thumbnail_url || null,
        duration_seconds: data.duration_seconds || null,
      })
      .select()
      .single();
  },

  // Update a video
  update: async (
    id: string,
    data: {
      title?: string;
      video_url?: string;
      thumbnail_url?: string;
      status?: string;
      views?: number;
    }
  ) => {
    return await supabase
      .from("videos")
      .update({
        title: data.title,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url,
        status: data.status,
        views: data.views,
      })
      .eq("id", id)
      .select()
      .single();
  },

  // Delete a video
  delete: async (id: string) => {
    return await supabase.from("videos").delete().eq("id", id);
  },

  // Increment video views
  incrementViews: async (id: string) => {
    const { data: video } = await supabase
      .from("videos")
      .select("views")
      .eq("id", id)
      .single();

    if (video && video.views !== null) {
      return await supabase
        .from("videos")
        .update({ views: video.views + 1 })
        .eq("id", id);
    }
  },
};
