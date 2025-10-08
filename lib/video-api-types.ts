/**
 * Video API Types
 * TypeScript types for video generation API
 */

// =====================================================
// Single Video Types
// =====================================================

export interface VideoCreationResult {
  success: boolean;
  video_id: string;
  status: string;
  progress: number;
  model: string;
  size: string;
  seconds: string;
  created_at: number;
  message: string;
}

export interface VideoStatusResponse {
  video_id: string;
  status: "in_progress" | "completed" | "failed" | "error";
  progress: number;
  model: string;
  size: string;
  seconds: string;
  created_at: number;
  completed_at?: number;
  download_url?: string;
  error?: string;
  message?: string;
}

// =====================================================
// Batch Video Types
// =====================================================

export interface BatchVideoConfig {
  prompt: string;
  model?: string;
  size?: string;
  seconds?: string;
}

export interface BatchVideoResult {
  success: boolean;
  video_id: string;
  status: string;
  message: string;
}

export interface VideoBatchCreateResponse {
  success: boolean;
  batch_id: string;
  videos: BatchVideoResult[];
  total_videos: number;
  message: string;
}

// =====================================================
// Variations Types
// =====================================================

export interface VideoVariationsRequest {
  prompt: string;
  variations: number; // 1-3
  model?: string;
  size?: string;
  seconds?: string;
  image_reference?: File;
}

// =====================================================
// Client-Side Video Tracking
// =====================================================

export type VideoStatus = "idle" | "uploading" | "processing" | "completed" | "error";

export interface TrackedVideo {
  id: string; // video_id from API
  dbId?: string; // database ID after saving to Supabase
  title: string;
  prompt: string;
  status: VideoStatus;
  progress: number;
  model: string;
  size: string;
  seconds: string;
  error?: string;
  createdAt: Date;
  result?: VideoCreationResult;
}

export interface BatchCreationState {
  mode: "single" | "variations" | "batch";
  videos: TrackedVideo[];
  isProcessing: boolean;
  completedCount: number;
  failedCount: number;
}

