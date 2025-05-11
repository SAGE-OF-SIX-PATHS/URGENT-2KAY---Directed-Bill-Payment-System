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
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./services/passport"));
const bill_routes_1 = __importDefault(require("./routes/bill.routes"));
const sponsorship_routes_1 = __importDefault(require("./routes/sponsorship.routes"));
const request_routes_1 = __importDefault(require("./routes/request.routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const paystack_1 = require("./config/paystack");
const emailRoutes_1 = require("./routes/emailRoutes");
const emailLoggerMiddleware_1 = require("./middlewares/emailLoggerMiddleware");
const emailErrorMiddleware_1 = require("./middlewares/emailErrorMiddleware");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "super-secret",
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
app.use("/bills", bill_routes_1.default);
app.use("/sponsorships", sponsorship_routes_1.default);
app.use("/request", request_routes_1.default);
app.use('/api/email', emailRoutes_1.emailRouter);
app.use("/transaction", payment_routes_1.default);
// Error Handling (should be last middleware)
app.use(emailErrorMiddleware_1.errorHandler);
// Health check route
app.get("/", (_req, res) => {
    res.send("API is working 🚀");
});
async function startServer() {
    try {
        await prisma.$connect();
        console.log("Connected to database ✅");
        app.listen(paystack_1.PORT, () => {
            console.log(`Server running on http://localhost:${paystack_1.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to connect to database ❌", error);
        process.exit(1); // Exit if database connection fails
    }
}
startServer();
