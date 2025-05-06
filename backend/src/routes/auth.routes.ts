import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import passport from "../service/passport";
import { generateToken } from "../utils/jwt";

const router = Router();
const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173").split(",");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Start Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);

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
  }
);

export default router;
