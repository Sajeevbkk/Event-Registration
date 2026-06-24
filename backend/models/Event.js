const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  availableTickets: {
    type: Number,
    default: 50,
  },
});

module.exports = mongoose.model("Event", eventSchema);
