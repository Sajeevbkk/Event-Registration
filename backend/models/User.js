const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
  },

  ticketCount: {
    type: Number,
  },

  contact: {
    type: String,
  },

  event: {
    type: String,
  },

  date: {
    type: Date,
  },

  paymentStatus: {
    type: Boolean,
  },

  date: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
