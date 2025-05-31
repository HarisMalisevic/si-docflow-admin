/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import { Strategy as BitbucketStrategy, Profile as BitbucketProfile } from 'passport-bitbucket-oauth2';
import DB from '../../database';
import { Strategy as passportStrategy } from 'passport';
import { BITBUCKET_API_NAME, BITBUCKET_USER_EMAIL_URL } from '../SSO_DEFAULTS';

type BitbucketEmail = {
    email: string;
    is_primary: boolean;
    is_confirmed: boolean;
};

type BitbucketEmailResponse = {
    values: BitbucketEmail[];
};


export default async function createBitbucketStrategy(): Promise<passportStrategy> {
    const bitbucketProvider = await DB.sso_providers.findOne({
        where: { api_name: BITBUCKET_API_NAME }
    });

    if (!bitbucketProvider) {
        throw new Error("Bitbucket OAuth provider not found in database!");
    }

    return new BitbucketStrategy({
        clientID: bitbucketProvider.client_id,
        clientSecret: bitbucketProvider.client_secret,
        callbackURL: bitbucketProvider.callback_url,
    },
        async (
            accessToken: string,
            refreshToken: string,
            profile: BitbucketProfile,
            done: (error: any, user?: any) => void
        ) => {
            try {
                const { default: fetch } = await import("node-fetch");
                const emailResponse = await fetch(BITBUCKET_USER_EMAIL_URL, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    }
                });

                const emailData = await emailResponse.json() as BitbucketEmailResponse;
                const email = emailData?.values?.find((e: any) => e.is_primary && e.is_confirmed)?.email;

                if (!email) {
                    return done(new Error("Primary email not found in Bitbucket account"), null);
                }


                const existingAdmin = await DB.admin_users.findOne({
                    where: {
                        sso_id: profile.id,
                        sso_provider: bitbucketProvider.id,
                    }
                });

                if (existingAdmin) return done(null, existingAdmin);


                const newAdmin = await DB.admin_users.create({
                    email,
                    sso_id: profile.id,
                    sso_provider: bitbucketProvider.id,
                    access_token: accessToken
                });

                return done(null, newAdmin);
            } catch (err) {
                return done(err, null);
            }
        }
    );
}
