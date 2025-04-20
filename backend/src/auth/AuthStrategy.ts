import { Strategy as OAuth2Strategy, VerifyCallback } from 'passport-oauth2';
import db from '../database/db';
import { Strategy as passportStrategy, Profile } from 'passport';
import SSOProvider from '../database/SSOProvider';
import createBitbucketStrategy from './bitbucketAuthStrategy'; 
import createGoogleStrategy from './googleAuthStrategy'; 


export default async function createAuthStrategy(ssoProvider: SSOProvider): Promise<passportStrategy> {

    console.log("Creating Auth Strategy for SSO Provider:", ssoProvider.api_name);

    switch (ssoProvider.api_name.toLowerCase()) {
        case 'bitbucket':
            return createBitbucketStrategy();  
        case 'google':
            return createGoogleStrategy();  
        default:

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
                const existingUser = await db.admin_users.findOne({
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
                const newUser = await db.admin_users.create({
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
}
