import { Request, Response } from "express";
import { getEnv } from "../config/env";
import { exchangeAuthCode } from "../services/authService";

/**
 * Step 1: Redirect user to the authorization URL
 * (this is the URL they need to visit to approve your app)
 */
export function startAuth(req: Request, res: Response) {
  const { API_BASE, CLIENT_ID, SCOPE } = getEnv();
  // Build URL to the long-lived token / oauth2 authorize endpoint.
  // Use a callback URL based on the current request so local testing uses
  // http://localhost:3000/auth/callback when you call the /auth/start endpoint locally.
  const state = "12345"; // optional, use for CSRF protection

  // Construct redirect URI from the incoming request (preserves host/port)
  const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;

  const params = [
    `response_type=code`,
    `client_id=${encodeURIComponent(CLIENT_ID)}`,
    `scope=${encodeURIComponent(SCOPE)}`,
    // Include redirect_uri raw to match the unencoded format you requested
    `redirect_uri=${redirectUri}`,
  ];

  if (state) params.push(`state=${encodeURIComponent(state)}`);

  const authUrl = `${API_BASE}/longtimetoken/oauth2/authorize?${params.join("&")}`;

  res.redirect(authUrl);
}

/**
 * Step 2: Handle callback from the API (after user approves)
 * Receives ?code=... from the Tax Authority API
 */
export async function handleAuthCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    const tokens = await exchangeAuthCode(code);

    return res.json({
      message: "Authentication successful",
      tokens,
    });

  } catch (error: any) {
    console.error("Auth callback error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
