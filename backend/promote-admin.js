require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("./config/db");
const User = require("./models/User");

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address. Usage: node promote-admin.js <email>");
  process.exit(1);
}

async function run() {
  await connectDatabase();
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.error(`User not found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Success! User ${user.email} has been promoted to role: ${user.role}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
