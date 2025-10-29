import axios from "axios";
import { getEnv } from "../config/env";
import { getAccessToken, getRefreshToken, saveTokens } from "../utils/tokenStore";
import { refreshAccessToken } from "./authService";

/**
 * Handles API communication with the Israeli Tax Authority donations endpoint.
 */
export async function sendDonationReport(donationData: any) {
  const { API_BASE } = getEnv();

  let accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Missing access token. Please authenticate first.");
  }

  try {
    // --- Send donation report ---
    const response = await axios.post(
      `${API_BASE}/Donations/v1/Report`,
      donationData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // --- If token expired, refresh and retry ---
    if (error.response?.status === 401) {
      console.warn("Access token expired, refreshing...");

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available, please reauthenticate.");
      }

      // Refresh access token. Ensure we persist the refresh_token as saveTokens expects it.
      const newTokens = await refreshAccessToken(refreshToken);
      saveTokens({
        access_token: newTokens.access_token,
        refresh_token: refreshToken,
        expires_in: newTokens.expires_in,
      });

      // Retry the request with new token
      const retryResponse = await axios.post(
        `${API_BASE}/Donations/v1/Report`,
        donationData,
        {
          headers: {
            Authorization: `Bearer ${newTokens.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return retryResponse.data;
    }

    console.error("Donation API error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error_description || "Failed to send donation report"
    );
  }
}
