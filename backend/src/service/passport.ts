import passport from "passport";
import {  Role } from "@prisma/client";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error("No email found"), undefined);

      // Check if user already exists
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // If not, create new user
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName,
            password: "", // no password needed for social login
            role: Role.BENEFACTEE, // Default role, or customize
          },
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err as Error, undefined);
    }
  }
));

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err as Error, undefined);
  }
});

export default passport;
