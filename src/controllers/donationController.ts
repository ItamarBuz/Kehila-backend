import { Request, Response } from "express";
import axios from "axios";
import { getEnv } from "../config/env";
import { getAccessToken } from "../utils/tokenStore";

/**
 * Send donation data to Israeli Tax Authority API
 */
export async function createDonation(req: Request, res: Response) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return res.status(401).json({ error: "Missing access token. Please authenticate first." });
    }

    const { API_BASE } = getEnv();

    // You can later add validation logic here
    const donationData = req.body;

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

    return res.status(200).json({
      message: "Donation report created successfully",
      response: response.data,
    });
  } catch (error: any) {
    console.error("Donation creation failed:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to create donation report",
      details: error.response?.data || error.message,
    });
  }
}
