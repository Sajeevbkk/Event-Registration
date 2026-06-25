const Event = require("../models/Event");
const prebuiltEvents = require("../data/prebuiltEvents");

const DEFAULT_TICKET_COUNT = 50;

async function seedPrebuiltEvents() {
  await Promise.all(
    prebuiltEvents.map((name, index) =>
      Event.updateOne(
        { name },
        {
          $setOnInsert: {
            name,
            ticketsAvailable: DEFAULT_TICKET_COUNT,
          },
          $set: {
            displayOrder: index + 1,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

module.exports = {
  DEFAULT_TICKET_COUNT,
  seedPrebuiltEvents,
};
