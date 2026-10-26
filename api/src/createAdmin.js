import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } =
    process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in .env"
    );
  }

  if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 72) {
    throw new Error("Admin password must be 12–72 characters.");
  }

  await mongoose.connect(MONGODB_URI);

  const email = ADMIN_EMAIL.trim().toLowerCase();

  const existing = await User.findOne({ email });

  if (existing) {
    throw new Error(
      "This email already exists. No account was changed."
    );
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    name: ADMIN_NAME || "Library Administrator",
    email,
    passwordHash,
    role: "ADMIN",
    isActive: true,
  });

  console.log("Administrator created successfully.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });