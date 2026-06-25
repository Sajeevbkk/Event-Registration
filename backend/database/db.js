const mongoose = require("mongoose");
const { seedPrebuiltEvents } = require("./seedEvents");

mongoose
  .connect("mongodb://127.0.0.1:27017/userdb")
  .then(async () => {
    console.log("Database Connected");
    await seedPrebuiltEvents();
    console.log("Prebuilt events are ready");
  })
  .catch((error) => {
    console.log(error);
  });
