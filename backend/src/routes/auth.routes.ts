import { Router } from "express";
import { loginUser } from "../controllers/auth.controller";
import passport from "../service/passport";
import { PrismaClient , User} from "@prisma/client";
import { generateToken } from "../utils/jwt"; // Adjust path to match your structure
import { registerUser } from "../controllers/auth.controller";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

router.post("/register", registerUser);
router.post("/login", loginUser);

// Start Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get("/google/callback", passport.authenticate("google", { session: false }), async (req, res) => {
  const user = req.user as User;
  const token = generateToken(user.id); // generate JWT
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
});


export default router;
