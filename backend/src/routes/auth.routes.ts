import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import passport from "../service/passport";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

router.post("/register", registerUser);
router.post("/login", loginUser);

// Start Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/?error=OAuthFailed`);
    }
   // send JSON instead of redirecting
   const user = req.user as any;

  
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // Now redirect to frontend with token and user info
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || "")}`;

    res.redirect(redirectUrl);
  }
);

export default router;
