const mongoose = require("mongoose");

const QuerySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Query || mongoose.model("Query", QuerySchema);