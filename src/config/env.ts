import * as dotenv from "dotenv";

// Load variables from .env file into process.env
dotenv.config();

// Define the shape of environment variables
interface EnvConfig {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  REDIRECT_URI: string;
  SCOPE: string;
  API_BASE: string;
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
}

// Helper function to ensure all required environment variables exist
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
}

// Export a typed getter function
export function getEnv(): EnvConfig {
  return {
    CLIENT_ID: required("CLIENT_ID"),
    CLIENT_SECRET: required("CLIENT_SECRET"),
    REDIRECT_URI: required("REDIRECT_URI"),
    SCOPE: required("SCOPE"),
    API_BASE: required("API_BASE"),
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
  };
}
