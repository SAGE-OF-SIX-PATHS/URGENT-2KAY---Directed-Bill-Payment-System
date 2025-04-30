"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const passport_1 = __importDefault(require("../service/passport"));
const jwt_1 = require("../utils/jwt"); // Adjust path to match your structure
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
router.post("/register", auth_controller_1.registerUser);
router.post("/login", auth_controller_1.loginUser);
// Start Google OAuth login
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Google OAuth callback
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), async (req, res) => {
    const user = req.user;
    const token = (0, jwt_1.generateToken)(user.id); // generate JWT
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
});
exports.default = router;
