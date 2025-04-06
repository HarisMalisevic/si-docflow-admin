import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './src/database/db'; 

import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const googleProvider = await db.oauth_providers.findOne({ where: { name: "google" } });

  if (!googleProvider) {
    throw new Error("Google OAuth provider not found in database!");
  }


passport.use(new GoogleStrategy({
    clientID: googleProvider.client_id,
    clientSecret: googleProvider.client_secret,
    callbackURL: "http://localhost:5000/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
  const existingAdmin = await db.admin_users.findOne({
    where: {
      oauth_id: profile.id,
      oauth_provider: googleProvider.id,
    }
  });

  if (existingAdmin) return done(null, existingAdmin);

  const newAdmin = await db.admin_users.create({
    email: profile.emails?.[0].value,
    oauth_id: profile.id,
    oauth_provider: googleProvider.id,
    access_token: accessToken
  });

  return done(null, newAdmin);
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async function (id: number, done) {
  try {
    const user = await db.admin_users.findByPk(id);
    done(null, user); 
  } catch (err) {
    done(err);
  }
});

})();

export default passport;