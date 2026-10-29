// pages/api/stripe/create-checkout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db.connect';
import { createCheckout } from '../../../server/controllers/stripeController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Establish database connection
    await dbConnect();

    // Call your existing controller function.
    // Note: Your createCheckout controller should be compatible with Next.js API route req/res.
    return await createCheckout(req, res);
  } catch (error: any) {
    console.error('Error in create-checkout API route:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
