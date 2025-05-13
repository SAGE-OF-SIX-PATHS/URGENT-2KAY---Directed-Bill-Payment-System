import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import session from "express-session";
import passport from "./services/passport";
import billRoutes from "./routes/bill.routes";
import sponsorshipRoutes from "./routes/sponsorship.routes";
import requestRoutes from "./routes/request.routes"
import providerRoutes from "./routes/provider.route";
import userRoutes from './routes/user.routes';


import bodyParser from "body-parser";
import paystackRoutes from "./routes/payment.routes";
import { PORT } from "./config/paystack";
import { emailRouter } from "./routes/emailRoutes";
import { loggerMiddleware } from './middlewares/emailLoggerMiddleware';
import { errorHandler } from './middlewares/emailErrorMiddleware';

const prisma = new PrismaClient();

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,  
  credentials: true,                
}));


app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret", 
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
app.use("/api/bills", billRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api", providerRoutes);
app.use('/api/users', userRoutes);

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