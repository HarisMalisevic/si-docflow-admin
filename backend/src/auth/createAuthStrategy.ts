import { Strategy as OAuth2Strategy, VerifyCallback } from 'passport-oauth2';
import DB from '../database';
import { Strategy as passportStrategy, Profile } from 'passport';
import SSOProvider from '../modules/SSOProvider/SSOProvider.model';


export default async function createAuthStrategy(ssoProvider: SSOProvider): Promise<passportStrategy> {

    return new OAuth2Strategy({
        clientID: ssoProvider.client_id,
        clientSecret: ssoProvider.client_secret,
        callbackURL: ssoProvider.callback_url,
        authorizationURL: ssoProvider.authorization_url,
        tokenURL: ssoProvider.token_url,
    },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                // Check if the user already exists
                const existingUser = await DB.admin_users.findOne({
                    where: {
                        sso_id: accessToken,
                        sso_provider: ssoProvider.id,
                    }
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                console.log("Profile:", profile)

                // Register a new user if they don't exist
                const newUser = await DB.admin_users.create({
                    email: profile.emails?.[0].value,
                    sso_id: profile.id,
                    sso_provider: ssoProvider.id,
                    access_token: accessToken
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    );
}

