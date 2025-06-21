import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateUser } from "../utils/authUtils";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
      passReqToCallback: true,
    },
    async (req: any, accessToken, refreshToken, profile, done) => {
      let role = "BENEFACTEE"; // default

      try {
        /* if (req.query.state) {
          console.log("this is the main role", req.query.state)
          const state = JSON.parse(decodeURIComponent(req.query.state));
          if (state.role) role = state.role;
        } */
        if (req.query.state) {
          try {
            const stateRaw = decodeURIComponent(req.query.state);
            let parsedState: any;

            try {
              parsedState = JSON.parse(stateRaw);
            } catch {
              // fallback in case someone passed just "BENEFACTOR" or "BENEFACTEE"
              parsedState = { role: stateRaw };
            }

            if (parsedState?.role) role = parsedState.role.toUpperCase();
          } catch (err) {
            console.error("Failed to parse state param:", err);
          }
        }
      } catch (error) {
        console.error("Failed to parse state param:", error);
      }

      console.log("👉 Role from state:", role);

      const user = await findOrCreateUser(profile, role);
      return done(null, user);
    }
  )
);

export default passport;
