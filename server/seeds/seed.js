import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.model.js";
import { MandiPrice } from "../models/MandiPrice.model.js";

await connectDB();

await User.findOneAndUpdate(
  { email: process.env.SEED_ADMIN_EMAIL || "admin@krishisetu.test" },
  {
    name: process.env.SEED_ADMIN_NAME || "Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@krishisetu.test",
    phone: process.env.SEED_ADMIN_PHONE || "9999999999",
    password: await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
      10,
    ),
    role: "admin",
    location: { state: "Maharashtra", district: "Pune" },
    isVerified: true,
  },
  { upsert: true, new: true },
);

await MandiPrice.deleteMany({});
await MandiPrice.insertMany(
  [
    ["Wheat", "Pune Mandi", "2026-09-01", 2150, 2300, 2440],
    ["Wheat", "Pune Mandi", "2026-09-08", 2200, 2360, 2480],
    ["Rice", "Nagpur Mandi", "2026-09-01", 2800, 3050, 3300],
    ["Rice", "Nagpur Mandi", "2026-09-08", 2920, 3140, 3380],
    ["Tomato", "Nashik Mandi", "2026-09-01", 900, 1180, 1450],
    ["Tomato", "Nashik Mandi", "2026-09-08", 980, 1260, 1520],
    ["Onion", "Lasalgaon Mandi", "2026-09-01", 1300, 1550, 1800],
    ["Onion", "Lasalgaon Mandi", "2026-09-08", 1380, 1620, 1900],
  ].map(([cropName, market, date, minPrice, modalPrice, maxPrice]) => ({
    cropName,
    market,
    date,
    minPrice,
    modalPrice,
    maxPrice,
  })),
);

console.log("Seed complete. Admin: admin@krishisetu.test / Admin@12345");
process.exit(0);
