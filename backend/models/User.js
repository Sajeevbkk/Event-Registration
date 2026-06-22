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

  paymentStatus: {
    type: Boolean,
  },
});

module.exports = mongoose.model("User", userSchema);
