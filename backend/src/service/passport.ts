import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateUser } from "../utils/authUtils"; // adjust path if different


passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await findOrCreateUser(profile);
  return done(null, user);
  }
));

export default passport;
