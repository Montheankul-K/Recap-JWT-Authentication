const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("successfully connected to database");
    })
    .catch((error) => {
      console.log("failed to connect to database");
      console.error(error);
      process.exit(1);
    });
};
