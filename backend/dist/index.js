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
<<<<<<< HEAD
const passport_1 = __importDefault(require("./service/passport"));
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
=======
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./service/passport"));
//Nzube
const body_parser_1 = __importDefault(require("body-parser"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const paystack_1 = require("./config/paystack");
const emailRoutes_1 = require("./routes/emailRoutes");
const emailLoggerMiddleware_1 = require("./middlewares/emailLoggerMiddleware");
const emailErrorMiddleware_1 = require("./middlewares/emailErrorMiddleware");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
>>>>>>> develop
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // your frontend URL
    credentials: true, // allow cookies
}));
<<<<<<< HEAD
app.use(passport_1.default.initialize());
// Routes
app.use("/auth", auth_routes_1.default);
=======
// Setup session middleware BEFORE passport
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "super-secret", // put a real secret in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
    },
}));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use(emailLoggerMiddleware_1.loggerMiddleware);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use("/auth", auth_routes_1.default);
// Routes
app.use('/api/email', emailRoutes_1.emailRouter);
app.use("/transaction", payment_routes_1.default);
// Error Handling (should be last middleware)
app.use(emailErrorMiddleware_1.errorHandler);
>>>>>>> develop
// Health check route
app.get("/", (_req, res) => {
    res.send("API is working 🚀");
});
async function startServer() {
    try {
        await prisma.$connect();
        console.log("Connected to database ✅");
<<<<<<< HEAD
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
=======
        app.listen(paystack_1.PORT, () => {
            console.log(`Server running on http://localhost:${paystack_1.PORT}`);
>>>>>>> develop
        });
    }
    catch (error) {
        console.error("Failed to connect to database ❌", error);
        process.exit(1); // Exit if database connection fails
    }
}
startServer();
