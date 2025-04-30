import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import passport from "./service/passport";
import billRoutes from './routes/bill.routes';

const prisma = new PrismaClient();


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,  // your frontend URL
  credentials: true,                // allow cookies
}));

app.use(passport.initialize());

// Routes
app.use("/auth", authRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("API is working 🚀");
});

app.use('/api/bills', billRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to database ✅");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database ❌", error);
    process.exit(1); // Exit if database connection fails
  }
}

startServer();