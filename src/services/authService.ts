import axios from "axios";
import { API_ENDPOINTS } from "../config/apiConfig";
import { getEnv } from "../config/env";
import { saveTokens } from "../utils/tokenStore";

/**
 * Exchange an authorization code for access + refresh tokens
 * (called after the redirect back from Tax Authority OAuth)
 */
export async function exchangeAuthCode(code: string) {
  try {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE } = getEnv();

    // Encode Basic Auth credentials
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
    });

    const response = await axios.post(API_ENDPOINTS.TOKEN, body.toString(), {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;

    if (!access_token || !refresh_token) {
      throw new Error("Token response missing required fields");
    }

    await saveTokens({ access_token, refresh_token, expires_in });
    return { access_token, refresh_token, expires_in };

  } catch (err: any) {
    console.error("❌ Failed to exchange authorization code:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * Refresh an expired access token using the stored refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const { CLIENT_ID, CLIENT_SECRET, SCOPE } = getEnv();

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: SCOPE,
    });

    const response = await axios.post(API_ENDPOINTS.TOKEN, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;

    await saveTokens({
      access_token,
      refresh_token: new_refresh_token || refreshToken, // fallback
      expires_in,
    });

    return { access_token, expires_in, refresh_token: new_refresh_token || refreshToken };

  } catch (err: any) {
    console.error("❌ Failed to refresh access token:", err.response?.data || err.message);
    throw err;
  }
}
