const Ride = require("../models/ridesModel");

// Fetch all rides
const getRides = async (req, res) => {
  try {
    const rides = await Ride.find();
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRides };
