"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const passport_1 = __importDefault(require("./service/passport"));
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // your frontend URL
    credentials: true, // allow cookies
}));
app.use(passport_1.default.initialize());
// Routes
app.use("/auth", auth_routes_1.default);
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
    }
    catch (error) {
        console.error("Failed to connect to database ❌", error);
        process.exit(1); // Exit if database connection fails
    }
}
startServer();
