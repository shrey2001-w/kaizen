// pages/api/addons/index.js
import dbConnect from '../../utils/db.connect';
import mongoose from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Ensure database connection is established
    await dbConnect();

    // Access the native MongoDB driver via Mongoose's connection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not available');
    }
    
    // Fetch add-ons data
    const addons = await db.collection('addOns').find({}).toArray();
    
    // Log the fetched add-ons on the server console
    console.log('Fetched add-ons:', addons);

    return res.status(200).json(addons);
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
