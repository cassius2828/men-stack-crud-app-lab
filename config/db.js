const mongoose = require("mongoose");
// mongoDB
const DB_URI = process.env.DB_URI;

///////////////////////////
// Connect to MongoDB
///////////////////////////

async function connect() {
  await mongoose.connect(DB_URI);
  //   mongoose.connection.on("connected", () =>
  //     console.log(`Connected to MongoDB: ${mongoose.connection.name}`)
  //   );
}
connect();
