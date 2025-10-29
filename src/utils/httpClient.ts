import axios, { AxiosInstance } from "axios";
import { getAccessToken, getRefreshToken, saveTokens } from "./tokenStore";
import { refreshAccessToken } from "../services/authService";
import { getEnv } from "../config/env";

const { API_BASE } = getEnv();

const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request interceptor to attach access token
 */
httpClient.interceptors.request.use(async (config: any) => {
  let token = getAccessToken();

  // If token expired, refresh it
  if (!token) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available, please re-authenticate");

    const newTokens = await refreshAccessToken(refreshToken);
    // Persist tokens. Use the known refreshToken value since the refresh endpoint may not return it.
    saveTokens({
      access_token: newTokens.access_token,
      refresh_token: refreshToken,
      expires_in: newTokens.expires_in,
    });

    token = newTokens.access_token;
  }

  // Ensure headers is a plain object and assign Authorization
  const existing = (config.headers || {}) as Record<string, string>;
  const merged: Record<string, string> = {
    ...existing,
    Authorization: `Bearer ${token}`,
  };

  config.headers = merged;

  return config;
});

/**
 * Optional: Response interceptor to log errors
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("HTTP Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default httpClient;
