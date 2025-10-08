/**
 * Supabase Authentication Helpers
 * 
 * Provides easy-to-use functions for authentication:
 * - Email/Password sign up and sign in
 * - OAuth (Google, GitHub, etc.) - ready for future use
 * - Session management
 * - User info
 */

import { supabase } from "./supabase";

export const auth = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Sign in with OAuth (Google, GitHub, etc.)
   * Ready for future use when you want to add OAuth
   */
  signInWithOAuth: async (
    provider: "google" | "github" | "facebook" | "twitter"
  ) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get the current user
   */
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  },

  /**
   * Reset password - sends reset email
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update user email
   */
  updateEmail: async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Listen to auth state changes
   * Useful for updating UI when user signs in/out
   */
  onAuthStateChange: (
    callback: (event: string, session: any) => void
  ) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

/**
 * Example Usage:
 * 
 * // Sign up
 * const { user, session } = await auth.signUp('user@example.com', 'password123');
 * 
 * // Sign in
 * const { user, session } = await auth.signIn('user@example.com', 'password123');
 * 
 * // Get current user
 * const user = await auth.getCurrentUser();
 * 
 * // Sign out
 * await auth.signOut();
 * 
 * // Listen to auth changes
 * const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
 *   console.log('Auth event:', event);
 *   console.log('Session:', session);
 * });
 */

