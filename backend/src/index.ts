import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import session from "express-session";
import passport from "./service/passport";

//Nzube
import bodyParser from "body-parser";
import paystackRoutes from "./routes/payment.routes";
import { PORT } from "./config/paystack";
import { emailRouter } from "./routes/emailRoutes";
import { loggerMiddleware } from './middlewares/emailLoggerMiddleware';
import { errorHandler } from './middlewares/emailErrorMiddleware';

const prisma = new PrismaClient();

dotenv.config();

const app = express();

// ✅ Improved CORS config with dynamic origin checking
const allowedOrigins = [
  "http://localhost:5173",
  "https://web-dash-spark.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
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

app.use(bodyParser.json());
app.use(express.json());
app.use(loggerMiddleware);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use('/api/email', emailRouter);
app.use("/transaction", paystackRoutes);

// Error Handling (should be last middleware)
app.use(errorHandler);

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
