var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Event = require("../models/Event");

const PREBUILT_EVENTS = [
  "Tech Conference 2024",
  "Music Festival",
  "Art Exhibition",
  "Food Carnival",
  "Startup Pitch Night",
  "Yoga Retreat",
  "Coding Bootcamp",
  "Marathon",
  "Gaming Tournament",
  "Photography Workshop",
];

async function initializeEvents() {
  const count = await Event.countDocuments();
  if (count === 0) {
    console.log("Initializing prebuilt events...");
    const eventsToInsert = PREBUILT_EVENTS.map(name => ({
      name,
      availableTickets: 50
    }));
    await Event.insertMany(eventsToInsert);
    console.log("Prebuilt events initialized.");
  }
}

// Call the initialization
initializeEvents().catch(console.error);

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/registrations", async (req, res) => {
  try {
    const requestedEvents = req.body.events || []; // Array of { eventName, ticketCount }

    // Check if tickets are available
    for (const reqEvent of requestedEvents) {
      const eventDoc = await Event.findOne({ name: reqEvent.eventName });
      if (!eventDoc) {
        return res.status(400).json({ error: `Event '${reqEvent.eventName}' not found` });
      }
      if (eventDoc.availableTickets < reqEvent.ticketCount) {
        return res.status(400).json({ error: `Not enough tickets available for ${reqEvent.eventName}` });
      }
    }

    // Deduct tickets
    for (const reqEvent of requestedEvents) {
      await Event.updateOne(
        { name: reqEvent.eventName },
        { $inc: { availableTickets: -reqEvent.ticketCount } }
      );
    }

    let user = new User({
      userName: req.body.userName,
      contact: req.body.contact,
      events: requestedEvents,
      date: req.body.date,
      paymentStatus: req.body.paymentStatus,
    });

    await user.save();

    res.json({
      message: "User Added Successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
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
  try {
    let userId = req.params.id;
    const requestedEvents = req.body.events || [];

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Temporarily restore tickets from existing user
    for (const oldEvent of existingUser.events) {
      await Event.updateOne(
        { name: oldEvent.eventName },
        { $inc: { availableTickets: oldEvent.ticketCount } }
      );
    }

    // Check if new tickets are available
    let ticketsAvailable = true;
    let errorMessage = "";
    for (const reqEvent of requestedEvents) {
      const eventDoc = await Event.findOne({ name: reqEvent.eventName });
      if (!eventDoc) {
        ticketsAvailable = false;
        errorMessage = `Event '${reqEvent.eventName}' not found`;
        break;
      }
      if (eventDoc.availableTickets < reqEvent.ticketCount) {
        ticketsAvailable = false;
        errorMessage = `Not enough tickets available for ${reqEvent.eventName}`;
        break;
      }
    }

    if (!ticketsAvailable) {
      // Revert the restoration
      for (const oldEvent of existingUser.events) {
        await Event.updateOne(
          { name: oldEvent.eventName },
          { $inc: { availableTickets: -oldEvent.ticketCount } }
        );
      }
      return res.status(400).json({ error: errorMessage });
    }

    // Deduct new tickets
    for (const reqEvent of requestedEvents) {
      await Event.updateOne(
        { name: reqEvent.eventName },
        { $inc: { availableTickets: -reqEvent.ticketCount } }
      );
    }

    await User.findByIdAndUpdate(userId, {
      userName: req.body.userName,
      contact: req.body.contact,
      events: requestedEvents,
      date: req.body.date,
      paymentStatus: req.body.paymentStatus,
    });

    res.json({ message: "User Edited Successfully!!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/registrations/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Restore tickets
      for (const oldEvent of user.events) {
        await Event.updateOne(
          { name: oldEvent.eventName },
          { $inc: { availableTickets: oldEvent.ticketCount } }
        );
      }
      await User.findByIdAndDelete(req.params.id);
    }

    res.json({ message: "User Deleted Successfully!!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
