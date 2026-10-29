const express = require("express");
const router = express.Router();
const { getRides } = require("../controllers/ridesController");

// API to fetch all rides
router.get("/", getRides);

module.exports = router;
