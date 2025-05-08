import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import session from "express-session";
import passport from "./service/passport";

const prisma = new PrismaClient();


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,  // your frontend URL
  credentials: true,                // allow cookies
}));

// Setup session middleware BEFORE passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret", // put a real secret in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);



app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("API is working 🚀");
});

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