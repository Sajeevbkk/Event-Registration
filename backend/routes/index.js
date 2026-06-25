var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Event = require("../models/Event");

function parseTicketCount(value) {
  const ticketCount = Number(value);

  if (!Number.isInteger(ticketCount) || ticketCount < 1) {
    return null;
  }

  return ticketCount;
}

function getEventName(value) {
  return String(value || "").trim();
}

function getPaymentStatus(value) {
  return value === true || value === "true";
}

function getRegistrationData(body, ticketCount, eventName) {
  return {
    userName: body.userName,
    ticketCount,
    contact: body.contact,
    event: eventName,
    date: body.date,
    paymentStatus: getPaymentStatus(body.paymentStatus),
  };
}

async function reserveTickets(eventName, ticketCount) {
  return Event.findOneAndUpdate(
    { name: eventName, ticketsAvailable: { $gte: ticketCount } },
    { $inc: { ticketsAvailable: -ticketCount } },
    { new: true },
  );
}

async function releaseTickets(eventName, ticketCount) {
  if (!eventName || ticketCount <= 0) return;

  await Event.updateOne(
    { name: eventName },
    { $inc: { ticketsAvailable: ticketCount } },
  );
}

async function sendEventError(res, eventName) {
  const eventError = await getEventError(eventName);

  return res.status(eventError.status).json({
    message: eventError.message,
  });
}

async function getEventError(eventName) {
  const eventExists = await Event.exists({ name: eventName });

  if (!eventExists) {
    return {
      status: 400,
      message: "Please select a valid prebuilt event.",
    };
  }

  return {
    status: 409,
    message: "Not enough tickets available for this event.",
  };
}

function getBulkRegistrationData(body) {
  if (!Array.isArray(body.events) || body.events.length === 0) {
    return {
      error: "Please select at least one event.",
    };
  }

  const selectedEventNames = new Set();
  const registrations = [];

  for (const eventItem of body.events) {
    const eventName = getEventName(eventItem.event);
    const ticketCount = parseTicketCount(eventItem.ticketCount);

    if (!eventName) {
      return {
        error: "Please select an event for each row.",
      };
    }

    if (ticketCount === null) {
      return {
        error: "Ticket count must be at least 1 for each event.",
      };
    }

    if (selectedEventNames.has(eventName)) {
      return {
        error: "Please select each event only once.",
      };
    }

    selectedEventNames.add(eventName);
    registrations.push(
      getRegistrationData(
        {
          userName: body.userName,
          contact: body.contact,
          date: eventItem.date,
          paymentStatus: body.paymentStatus,
        },
        ticketCount,
        eventName,
      ),
    );
  }

  return { registrations };
}

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ displayOrder: 1, name: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load events." });
  }
});

router.post("/registrations", async (req, res) => {
  const ticketCount = parseTicketCount(req.body.ticketCount);
  const eventName = getEventName(req.body.event);

  if (ticketCount === null) {
    return res.status(400).json({
      message: "Ticket count must be at least 1.",
    });
  }

  try {
    const reservation = await reserveTickets(eventName, ticketCount);

    if (!reservation) {
      return sendEventError(res, eventName);
    }

    try {
      const user = new User(
        getRegistrationData(req.body, ticketCount, eventName),
      );
      await user.save();
    } catch (error) {
      await releaseTickets(eventName, ticketCount);
      throw error;
    }

    res.status(201).json({
      message: "User Added Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add registration." });
  }
});

router.post("/registrations/bulk", async (req, res) => {
  const { registrations, error } = getBulkRegistrationData(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const reservedRegistrations = [];

  try {
    for (const registration of registrations) {
      const reservation = await reserveTickets(
        registration.event,
        registration.ticketCount,
      );

      if (!reservation) {
        await Promise.all(
          reservedRegistrations.map((reservedRegistration) =>
            releaseTickets(
              reservedRegistration.event,
              reservedRegistration.ticketCount,
            ),
          ),
        );

        const eventError = await getEventError(registration.event);

        return res.status(eventError.status).json({
          message: eventError.message,
        });
      }

      reservedRegistrations.push(registration);
    }

    try {
      await User.insertMany(registrations);
    } catch (error) {
      await Promise.all(
        reservedRegistrations.map((registration) =>
          releaseTickets(registration.event, registration.ticketCount),
        ),
      );
      throw error;
    }

    res.status(201).json({
      message: "User Added Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add registrations." });
  }
});

router.get("/registrations", async (req, res) => {
  try {
    let user = await User.find();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load registrations." });
  }
});

router.get("/registrations/:id", async (req, res) => {
  try {
    let userId = req.params.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Registration not found." });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load registration." });
  }
});

router.put("/registrations/:id", async (req, res) => {
  const userId = req.params.id;
  const ticketCount = parseTicketCount(req.body.ticketCount);
  const eventName = getEventName(req.body.event);

  if (ticketCount === null) {
    return res.status(400).json({
      message: "Ticket count must be at least 1.",
    });
  }

  try {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "Registration not found." });
    }

    const eventExists = await Event.exists({ name: eventName });

    if (!eventExists) {
      return res.status(400).json({
        message: "Please select a valid prebuilt event.",
      });
    }

    const existingEventName = existingUser.event;
    const existingTicketCount = Number(existingUser.ticketCount) || 0;
    const registrationData = getRegistrationData(
      req.body,
      ticketCount,
      eventName,
    );

    if (eventName === existingEventName) {
      const ticketDifference = ticketCount - existingTicketCount;

      if (ticketDifference > 0) {
        const reservation = await reserveTickets(eventName, ticketDifference);

        if (!reservation) {
          return res.status(409).json({
            message: "Not enough tickets available for this event.",
          });
        }
      }

      try {
        await User.findByIdAndUpdate(userId, registrationData, {
          runValidators: true,
        });
      } catch (error) {
        if (ticketDifference > 0) {
          await releaseTickets(eventName, ticketDifference);
        }
        throw error;
      }

      if (ticketDifference < 0) {
        await releaseTickets(eventName, Math.abs(ticketDifference));
      }
    } else {
      const reservation = await reserveTickets(eventName, ticketCount);

      if (!reservation) {
        return res.status(409).json({
          message: "Not enough tickets available for this event.",
        });
      }

      try {
        await User.findByIdAndUpdate(userId, registrationData, {
          runValidators: true,
        });
      } catch (error) {
        await releaseTickets(eventName, ticketCount);
        throw error;
      }

      await releaseTickets(existingEventName, existingTicketCount);
    }

    res.json({ message: "User Edited Successfully!!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to edit registration." });
  }
});

router.delete("/registrations/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Registration not found." });
    }

    await releaseTickets(user.event, Number(user.ticketCount) || 0);

    res.json({ message: "User Deleted Successfully!!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete registration." });
  }
});

module.exports = router;
