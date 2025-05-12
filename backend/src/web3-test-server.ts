import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

// Blockchain routes
import blockchainRoutes from './routes/blockchain.routes';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Define a port
const PORT = process.env.PORT || 5000;

// Basic CORS config
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(express.json());

// Mount blockchain routes
app.use("/blockchain", blockchainRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("Web3 Test Server is running! 🔗");
});

// Start the server
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to database ✅");

    app.listen(PORT, () => {
      console.log(`Web3 Test Server running on http://localhost:${PORT}`);
      console.log(`Blockchain API available at http://localhost:${PORT}/blockchain`);
    });
  } catch (error) {
    console.error("Failed to connect to database ❌", error);
    process.exit(1);
  }
}

startServer(); 