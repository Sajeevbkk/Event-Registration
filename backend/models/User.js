const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
  },

  contact: {
    type: String,
  },

  events: [{
    eventName: {
      type: String,
    },
    ticketCount: {
      type: Number,
    }
  }],

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
