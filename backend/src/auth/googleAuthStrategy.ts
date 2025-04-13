import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from '../database/db';
import { Strategy as passportStrategy } from 'passport';

export const GOOGLE_API_NAME = "google";

export default async function createGoogleStrategy(): Promise<passportStrategy> {


    const googleProvider = await db.sso_providers.findOne({ where: { api_name: GOOGLE_API_NAME } });

    if (!googleProvider) {
        throw new Error("Google OAuth provider not found in database!");
    }

    return new GoogleStrategy({
        clientID: googleProvider.client_id,
        clientSecret: googleProvider.client_secret,
        callbackURL: googleProvider.callback_url,
    },
        async (accessToken, refreshToken, profile, done) => {
            const existingAdmin = await db.admin_users.findOne({
                where: {
                    sso_id: profile.id,
                    sso_provider: googleProvider.id,
                }
            });

            if (existingAdmin) return done(null, existingAdmin);

            const newAdmin = await db.admin_users.create({
                email: profile.emails?.[0].value,
                sso_id: profile.id,
                sso_provider: googleProvider.id,
                access_token: accessToken
            });

            return done(null, newAdmin);
        }
    );
}
