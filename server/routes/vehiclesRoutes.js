// import express from "express";
const express = require("express");
const { getAllVehicles, addVehicle } = require("../controllers/vehiclesController.js");
// const router = express.Router();

const router = express.Router();

// Route to fetch all vehicles
router.get("/", getAllVehicles);

// Route to add a new vehicle

module.exports = router;
