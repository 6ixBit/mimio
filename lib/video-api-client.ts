/**
 * Video API Client
 * Clean abstraction for video generation API calls
 */

import { getApiUrl, API_ENDPOINTS } from "./api-config";
import type {
  VideoCreationResult,
  VideoStatusResponse,
  BatchVideoConfig,
  VideoBatchCreateResponse,
  VideoVariationsRequest,
} from "./video-api-types";

/**
 * Video API Client
 */
export class VideoApiClient {
  /**
   * Create a single video
   */
  static async createSingle(params: {
    prompt: string;
    model: string;
    size: string;
    seconds: string;
    imageReference?: File;
    project_id?: string;
  }): Promise<VideoCreationResult> {
    const formData = new FormData();
    formData.append("prompt", params.prompt);
    formData.append("model", params.model);
    formData.append("size", params.size);
    formData.append("seconds", params.seconds);

    if (params.project_id) {
      formData.append("project_id", params.project_id);
    }

    if (params.imageReference) {
      // Ensure proper MIME type
      let mimeType = params.imageReference.type;
      console.log(
        "Original file MIME type:",
        mimeType,
        "for file:",
        params.imageReference.name
      );

      if (!mimeType || mimeType === "application/octet-stream") {
        const ext = params.imageReference.name.toLowerCase().split(".").pop();
        const mimeMap: Record<string, string> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          mp4: "video/mp4",
        };
        mimeType = mimeMap[ext || ""] || "application/octet-stream";
        console.log(
          "Corrected MIME type to:",
          mimeType,
          "based on extension:",
          ext
        );
      }

      const correctedFile = new File(
        [params.imageReference],
        params.imageReference.name,
        {
          type: mimeType,
          lastModified: params.imageReference.lastModified,
        }
      );

      console.log("Final file MIME type:", correctedFile.type);
      formData.append("image_reference", correctedFile);
    }

    const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_VIDEO), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create video");
    }

    return await response.json();
  }

  /**
   * Create variations of a video (same prompt, multiple outputs)
   */
  static async createVariations(
    params: VideoVariationsRequest
  ): Promise<VideoBatchCreateResponse> {
    const formData = new FormData();
    formData.append("prompt", params.prompt);
    formData.append("variations", params.variations.toString());
    formData.append("model", params.model || "sora-2");
    formData.append("size", params.size || "720x1280");
    formData.append("seconds", params.seconds || "8");

    if (params.project_id) {
      formData.append("project_id", params.project_id);
    }

    if (params.image_reference) {
      // Ensure proper MIME type
      let mimeType = params.image_reference.type;
      console.log(
        "Original file MIME type:",
        mimeType,
        "for file:",
        params.image_reference.name
      );

      if (!mimeType || mimeType === "application/octet-stream") {
        const ext = params.image_reference.name.toLowerCase().split(".").pop();
        const mimeMap: Record<string, string> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          mp4: "video/mp4",
        };
        mimeType = mimeMap[ext || ""] || "application/octet-stream";
        console.log(
          "Corrected MIME type to:",
          mimeType,
          "based on extension:",
          ext
        );
      }

      const correctedFile = new File(
        [params.image_reference],
        params.image_reference.name,
        {
          type: mimeType,
          lastModified: params.image_reference.lastModified,
        }
      );

      console.log("Final file MIME type:", correctedFile.type);
      formData.append("image_reference", correctedFile);
    }

    const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_VARIATIONS), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create variations");
    }

    return await response.json();
  }

  /**
   * Create batch of different videos
   */
  static async createBatch(
    videos: BatchVideoConfig[]
  ): Promise<VideoBatchCreateResponse> {
    if (videos.length > 3) {
      throw new Error("Maximum 3 videos per batch");
    }

    if (videos.length < 1) {
      throw new Error("At least 1 video required");
    }

    const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_BATCH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videos }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create batch");
    }

    return await response.json();
  }

  /**
   * Get video status
   */
  static async getStatus(videoId: string): Promise<VideoStatusResponse> {
    const response = await fetch(
      getApiUrl(API_ENDPOINTS.VIDEO_STATUS(videoId))
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video status");
    }

    return await response.json();
  }

  /**
   * Get batch status for multiple videos
   */
  static async getBatchStatus(
    videoIds: string[]
  ): Promise<VideoStatusResponse[]> {
    if (videoIds.length > 10) {
      throw new Error("Maximum 10 videos per status check");
    }

    const response = await fetch(
      `${getApiUrl(API_ENDPOINTS.BATCH_STATUS)}?video_ids=${videoIds.join(",")}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch batch status");
    }

    return await response.json();
  }

  /**
   * Download video
   */
  static async downloadVideo(videoId: string): Promise<Blob> {
    const response = await fetch(
      getApiUrl(API_ENDPOINTS.VIDEO_DOWNLOAD(videoId))
    );

    if (!response.ok) {
      throw new Error("Failed to download video");
    }

    return await response.blob();
  }

  /**
   * Delete video
   */
  static async deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(
      getApiUrl(API_ENDPOINTS.VIDEO_DELETE(videoId)),
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete video");
    }
  }
}
