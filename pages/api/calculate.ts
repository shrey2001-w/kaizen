import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../utils/db.connect";
const { calculatePrice } = require("../../server/controllers/calculateDistanceController");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();
    return await calculatePrice(req, res);
  } catch (error) {
    console.error("Error in API /calculate route:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}