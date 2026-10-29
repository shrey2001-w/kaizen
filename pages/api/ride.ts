// pages/api/rides/index.js

import dbConnect from '../../utils/db.connect';
import Ride from '../../server/models/ridesModel';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Ensure database connection is established
    await dbConnect();

    // Fetch all rides using your Mongoose model
    const rides = await Ride.find();
    return res.status(200).json(rides);
  } catch (error) {
    return res.status(500).json({ 
        message: 'Internal Server Error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
  }
}
