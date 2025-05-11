"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const authUtils_1 = require("../utils/authUtils");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    let role = "BENEFACTEE"; // default
    try {
        if (req.query.state) {
            console.log("this is the main role", req.query.state);
            const state = JSON.parse(decodeURIComponent(req.query.state));
            if (state.role)
                role = state.role;
        }
    }
    catch (error) {
        console.error("Failed to parse state param:", error);
    }
    console.log("👉 Role from state:", role);
    const user = await (0, authUtils_1.findOrCreateUser)(profile, role);
    return done(null, user);
}));
exports.default = passport_1.default;
