var express = require("express");
var router = express.Router();
const User = require("../models/User");

router.post("/registrations", async (req, res) => {
  let user = new User({
    userName: req.body.userName,
    ticketCount: req.body.ticketCount,
    contact: req.body.contact,
    paymentStatus: req.body.paymentStatus,
    date: req.body.date,
  });

  await user.save();

  res.json({
    message: "User Added Successfully",
  });
});

router.get("/registrations", async (req, res) => {
  let user = await User.find();

  res.json(user);
});

router.get("/registrations/:id", async (req, res) => {
  let userId = req.params.id;

  let user = await User.findById(userId);
  res.json(user);
});

router.put("/registrations/:id", async (req, res) => {
  let userId = req.params.id;

  await User.findByIdAndUpdate(userId, {
    userName: req.body.userName,
    ticketCount: req.body.ticketCount,
    contact: req.body.contact,
    paymentStatus: req.body.paymentStatus,
    date: req.body.date,
  });

  res.json({ message: "User Edited Successfully!!" });
});

router.delete("/registrations/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  res.json({ message: "User Deleted Successfully!!" });
});

module.exports = router;
