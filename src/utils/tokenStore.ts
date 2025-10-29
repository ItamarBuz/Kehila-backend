import fs from "fs";
import path from "path";

interface TokenData {
  access_token: string;
  refresh_token: string;  // REQUIRED
  expires_in: number;
  created_at?: number;
}

const TOKEN_PATH = path.resolve(__dirname, "../../tokens.json");

let tokens: TokenData | null = null;

/**
 * Store tokens in memory + persist to disk
 */
export function saveTokens(data: TokenData) {
  tokens = {
    ...data,
    created_at: Date.now(),
  };

  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  } catch (err) {
    console.error("Failed to write tokens.json:", err);
  }
}

/**
 * Load tokens from memory or disk
 */
export function loadTokens(): TokenData | null {
  if (tokens) return tokens;

  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
      tokens = JSON.parse(raw);
      return tokens;
    }
  } catch (err) {
    console.error("Failed to read tokens.json:", err);
  }

  return null;
}

/**
 * Get access token if valid
 */
export function getAccessToken(): string | null {
  if (!tokens) loadTokens();
  if (!tokens) return null;

  if (isAccessTokenExpired()) return null;

  return tokens.access_token;
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (!tokens) loadTokens();
  return tokens?.refresh_token || null;
}

/**
 * Check if access token expired
 */
export function isAccessTokenExpired(): boolean {
  if (!tokens || !tokens.created_at) return true;

  const now = Date.now();
  const expiresAt = tokens.created_at + tokens.expires_in * 1000;
  return now >= expiresAt;
}
