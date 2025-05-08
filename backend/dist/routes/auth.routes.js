"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const passport_1 = __importDefault(require("../service/passport"));
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173").split(",");
router.post("/register", auth_controller_1.registerUser);
router.post("/login", auth_controller_1.loginUser);
// Start Google OAuth login
<<<<<<< HEAD
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
=======
router.get("/google", (req, res, next) => {
    const state = req.query.state?.toString() || "";
    console.log("this is the state from the authRoute", state);
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state, // ✅ pass the state manually
        session: false,
    })(req, res, next);
});
;
>>>>>>> develop
// Google OAuth callback
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), async (req, res) => {
    const user = req.user;
    const token = (0, jwt_1.generateToken)(user.id);
    // Choose a valid frontend URL
    const redirectBase = req.headers.origin && FRONTEND_URLS.includes(req.headers.origin)
        ? req.headers.origin
        : FRONTEND_URLS[0]; // default
    // Encode user data safely
    const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    }));
    res.redirect(`${redirectBase}/auth/callback?token=${token}&user=${userData}`);
});
exports.default = router;
