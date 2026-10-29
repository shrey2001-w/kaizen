// pages/api/vehicles/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../utils/db.connect';
import Vehicle from '../../server/models/vehicleModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Establish the database connection first
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Fetch all vehicles from the database
      const vehicles = await Vehicle.find();
      return res.status(200).json(vehicles);
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching vehicles", error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { type, price_per_km, price_per_hour } = req.body;

      // Validate input
      if (!type || !price_per_km || !price_per_hour) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create a new vehicle document and save to the database
      const newVehicle = new Vehicle({ type, price_per_km, price_per_hour });
      await newVehicle.save();

      return res.status(201).json({ message: "Vehicle added successfully", newVehicle });
    } catch (error: any) {
      return res.status(500).json({ message: "Error adding vehicle", error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
