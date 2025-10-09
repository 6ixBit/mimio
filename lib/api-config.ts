/**
 * API Configuration
 * Centralized API endpoint management with environment switching
 */

export type Environment = "local" | "production";

// API Base URLs
const API_BASE_URLS = {
  local: "http://localhost:8006",
  production: "https://your-production-url.com", // Update with actual production URL
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Videos
  CREATE_VIDEO: "/api/videos/create",
  CREATE_BATCH: "/api/videos/create-batch",
  CREATE_VARIATIONS: "/api/videos/create-variations",
  VIDEO_STATUS: (videoId: string) => `/api/videos/${videoId}/status`,
  VIDEO_DOWNLOAD: (videoId: string) => `/api/videos/${videoId}/download`,
  VIDEO_DELETE: (videoId: string) => `/api/videos/${videoId}`,
  BATCH_STATUS: "/api/videos/batch/status",

  // Video Analysis
  ANALYZE_VIDEO: "/api/analyze-video",

  // System
  ROOT: "/",
  HEALTH: "/health",
} as const;

/**
 * API Configuration Class
 */
class ApiConfig {
  private static instance: ApiConfig;
  private currentEnv: Environment;

  private constructor() {
    // Initialize from localStorage or default to local
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("api-environment") as Environment;
      this.currentEnv = saved || "local";
    } else {
      this.currentEnv = "local";
    }
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.currentEnv;
  }

  /**
   * Set environment and save to localStorage
   */
  public setEnvironment(env: Environment): void {
    this.currentEnv = env;
    if (typeof window !== "undefined") {
      localStorage.setItem("api-environment", env);
    }
  }

  /**
   * Get base URL for current environment
   */
  public getBaseUrl(): string {
    return API_BASE_URLS[this.currentEnv];
  }

  /**
   * Build full API URL
   */
  public buildUrl(endpoint: string): string {
    return `${this.getBaseUrl()}${endpoint}`;
  }

  /**
   * Toggle between environments
   */
  public toggleEnvironment(): Environment {
    this.currentEnv = this.currentEnv === "local" ? "production" : "local";
    if (typeof window !== "undefined") {
      localStorage.setItem("api-environment", this.currentEnv);
    }
    return this.currentEnv;
  }
}

// Export singleton instance
export const apiConfig = ApiConfig.getInstance();

/**
 * Helper function to get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return apiConfig.buildUrl(endpoint);
};

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): Environment => {
  return apiConfig.getEnvironment();
};

/**
 * Set environment
 */
export const setEnvironment = (env: Environment): void => {
  apiConfig.setEnvironment(env);
};

/**
 * Toggle environment
 */
export const toggleEnvironment = (): Environment => {
  return apiConfig.toggleEnvironment();
};
