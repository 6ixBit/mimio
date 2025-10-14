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

  // Get all projects with video counts
  getAllWithVideoCounts: async (userId: string) => {
    return await supabase
      .from("projects")
      .select(
        `
        *,
        videos:videos(count)
      `
      )
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

  // Get public templates (admin-curated)
  getPublic: async () => {
    return await supabase
      .from("ad_templates")
      .select("*")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("created_at", { ascending: false });
  },

  // Get user's custom templates (created + saved)
  getCustom: async (userId: string) => {
    try {
      // Templates created by the user
      const { data: created, error: createdError } = await supabase
        .from("ad_templates")
        .select("*")
        .eq("is_active", true)
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (createdError) throw createdError;

      // Templates saved by the user
      const { data: savedLinks, error: savedLinksError } = await supabase
        .from("user_saved_templates")
        .select("template_id")
        .eq("user_id", userId);

      if (savedLinksError) throw savedLinksError;

      let saved: any[] = [];
      if (savedLinks && savedLinks.length > 0) {
        const templateIds = savedLinks.map((r: any) => r.template_id);
        const { data: savedTemplates, error: savedTemplatesError } =
          await supabase
            .from("ad_templates")
            .select("*")
            .in("id", templateIds)
            .eq("is_active", true);

        if (savedTemplatesError) throw savedTemplatesError;
        saved = savedTemplates || [];
      }

      // Merge and deduplicate by id
      const mergedMap = new Map<string, any>();
      [...(created || []), ...saved].forEach((t: any) => {
        mergedMap.set(t.id, t);
      });

      const merged = Array.from(mergedMap.values()).sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return { data: merged, error: null } as any;
    } catch (error) {
      return { data: null, error } as any;
    }
  },

  // Save a template to user's custom collection
  saveTemplate: async (templateId: string, userId: string) => {
    return await supabase
      .from("user_saved_templates")
      .insert([{ template_id: templateId, user_id: userId }])
      .select()
      .single();
  },

  // Remove a template from user's custom collection
  unsaveTemplate: async (templateId: string, userId: string) => {
    return await supabase
      .from("user_saved_templates")
      .delete()
      .eq("template_id", templateId)
      .eq("user_id", userId);
  },

  // Check if user has saved a template
  isSaved: async (templateId: string, userId: string) => {
    const { data, error } = await supabase
      .from("user_saved_templates")
      .select("id")
      .eq("template_id", templateId)
      .eq("user_id", userId)
      .single();

    return { isSaved: !!data && !error, error };
  },

  // Create a new template
  create: async (data: {
    title: string;
    description: string;
    video_type: string;
    video_prompt: string;
    original_video_url: string;
    model: string;
    size: string;
    duration_seconds: number;
    thumbnail_url?: string;
    is_active?: boolean;
    is_public?: boolean;
    created_by?: string;
    category?: string;
  }) => {
    return await supabase.from("ad_templates").insert([data]).select().single();
  },

  // Delete a template (only for user-created templates)
  delete: async (templateId: string, userId: string) => {
    return await supabase
      .from("ad_templates")
      .delete()
      .eq("id", templateId)
      .eq("created_by", userId) // Ensure only the creator can delete
      .eq("is_public", false); // Only allow deletion of custom templates
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
      status?: string;
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
        status: data.status || "completed",
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

// =====================================================
// SOCIAL MEDIA ACCOUNTS API
// =====================================================

export const socialMediaApi = {
  // Get all connected accounts for a user
  getAll: async (userId: string) => {
    return await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  // Get accounts by platform
  getByPlatform: async (userId: string, platform: "instagram" | "tiktok") => {
    return await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform)
      .order("created_at", { ascending: false });
  },

  // Create a new social media account connection
  create: async (
    userId: string,
    data: {
      platform: "instagram" | "tiktok";
      platform_user_id: string;
      username: string;
      display_name?: string;
      profile_picture_url?: string;
      access_token: string;
      refresh_token?: string;
      token_expires_at?: string;
    }
  ) => {
    return await supabase
      .from("social_media_accounts")
      .insert([{ user_id: userId, ...data }])
      .select()
      .single();
  },

  // Update account status or tokens
  update: async (
    accountId: string,
    data: {
      access_token?: string;
      refresh_token?: string;
      token_expires_at?: string;
      connection_status?: "connected" | "disconnected" | "expired" | "error";
      is_active?: boolean;
      error_message?: string;
      last_used_at?: string;
    }
  ) => {
    return await supabase
      .from("social_media_accounts")
      .update(data)
      .eq("id", accountId);
  },

  // Disconnect/delete an account
  delete: async (accountId: string) => {
    return await supabase
      .from("social_media_accounts")
      .delete()
      .eq("id", accountId);
  },
};

/**
 * Video Posts API (for tracking posts to social media)
 */
export const videoPostsApi = {
  // Get all posts for a video
  getByVideo: async (videoId: string) => {
    return await supabase
      .from("video_posts")
      .select("*, social_media_account:social_media_accounts(*)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });
  },

  // Get all posts by user
  getByUser: async (userId: string) => {
    return await supabase
      .from("video_posts")
      .select(
        "*, video:videos(*), social_media_account:social_media_accounts(*)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  // Create a new post
  create: async (
    userId: string,
    data: {
      video_id: string;
      social_media_account_id: string;
      platform: "instagram" | "tiktok";
      caption?: string;
    }
  ) => {
    return await supabase
      .from("video_posts")
      .insert([{ user_id: userId, ...data }])
      .select()
      .single();
  },

  // Update post status
  update: async (
    postId: string,
    data: {
      status?: "pending" | "uploading" | "published" | "failed";
      platform_post_id?: string;
      post_url?: string;
      error_message?: string;
      posted_at?: string;
      views_count?: number;
      likes_count?: number;
      comments_count?: number;
      shares_count?: number;
    }
  ) => {
    return await supabase.from("video_posts").update(data).eq("id", postId);
  },
};

// =====================================================
// STORAGE API
// =====================================================

export const storageApi = {
  // Upload video to storage
  uploadVideo: async (
    userId: string,
    videoBlob: Blob,
    fileName: string
  ): Promise<{
    data: { path: string; publicUrl: string } | null;
    error: any;
  }> => {
    try {
      // Create path: userId/fileName
      const filePath = `${userId}/${fileName}`;

      // Upload to storage bucket
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(filePath, videoBlob, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (error) {
        return { data: null, error };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      return {
        data: {
          path: filePath,
          publicUrl: publicUrlData.publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete video from storage
  deleteVideo: async (filePath: string) => {
    return await supabase.storage.from("videos").remove([filePath]);
  },

  // Get video URL
  getVideoUrl: (filePath: string) => {
    const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
    return data.publicUrl;
  },
};
