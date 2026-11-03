import type { NextApiRequest, NextApiResponse } from "next";
import { stripeWebhookHandler } from "../../../server/controllers/stripeController";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dbModule = require("../../../server/db");
const connectDB = dbModule?.default || dbModule?.connectDB || dbModule;

// Stripe verifies the signature against the exact raw bytes,
// so Next.js must NOT parse the body.
export const config = {
  api: {
    bodyParser: false,
  },
};

const readRawBody = (req: NextApiRequest): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) =>
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
    );
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (typeof connectDB === "function") {
      await connectDB();
    }

    // The controller expects req.body to be the raw Buffer
    const rawBody = await readRawBody(req);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).body = rawBody;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await stripeWebhookHandler(req as any, res as any);
  } catch (error) {
    console.error("Stripe webhook route error:", error);
    return res.status(500).json({ error: "Webhook route failed" });
  }
}