import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import passport from "../service/passport";
import { generateToken } from "../utils/jwt"; // Adjust path to match your structure


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

router.post("/register", registerUser);
router.post("/login", loginUser);

// Start Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get("/google/callback", passport.authenticate("google", { session: false }), async (req, res) => {
  const user = req.user as any;
  const token = generateToken(user.id); // generate JWT
  res.json({ message: "Login successful", token, user });
});


export default router;
