// import Vehicle from "../models/vehiclesModel.js";
const Vehicle = require("../models/vehicleModel.js");
// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find(); // Fetch all documents
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error });
  }
};

// Add a new vehicle
const addVehicle = async (req, res) => {
  try {
    const { type, price_per_km, price_per_hour } = req.body;

    // Validate input
    if (!type || !price_per_km || !price_per_hour) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new vehicle
    const newVehicle = new Vehicle({ type, price_per_km, price_per_hour });
    await newVehicle.save();

    res.status(201).json({ message: "Vehicle added successfully", newVehicle });
  } catch (error) {
    res.status(500).json({ message: "Error adding vehicle", error });
  }
};

module.exports = { getAllVehicles ,  addVehicle};