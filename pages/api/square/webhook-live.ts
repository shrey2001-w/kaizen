// pages/api/stripe/webhook.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { squareWebhookHandler } from "../../../server/controllers/stripeController";
import { log } from "node:console";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Read the raw body from the request
    const buf = await getRawBody(req);
    // Attach rawBody to req so that your controller can access it.
    (req as any).rawBody = buf.toString("utf8");
    console.log("Raw body received:", (req as any).rawBody);
    return await squareWebhookHandler(req, res);
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

// Helper function to read the raw body as a Buffer.
const getRawBody = async (req: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};
