/**
 * Configuration utilities for the application
 */

export const config = {
  /**
   * Get the backend URL from environment variables
   * Falls back to localhost:8000 if not set
   */
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
} as const;

/**
 * Helper function to construct API URLs
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.backendUrl}/${cleanEndpoint}`;
};
