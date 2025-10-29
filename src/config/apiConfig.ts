import { getEnv } from "./env";

/**
 * This module centralizes all API-related constants and endpoints.
 * You can easily switch between sandbox and production environments here.
 */

const { API_BASE } = getEnv();

export const API_ENDPOINTS = {
  // OAuth2 authorization and token endpoints
  AUTHORIZE: `${API_BASE}/longtimetoken/oauth2/authorize`,
  TOKEN: `${API_BASE}/longtimetoken/oauth2/token`,

  // Donation reporting endpoint
  DONATION_REPORT: `${API_BASE}/Donations/v1/Report`,
};

// Optional: common OAuth2 parameters (for readability)
export const OAUTH_PARAMS = {
  RESPONSE_TYPE: "code",  
};

// Optional: define expiration defaults (4 hours)
export const TOKEN_EXPIRATION_MS = 4 * 60 * 60 * 1000; // 4 hours

