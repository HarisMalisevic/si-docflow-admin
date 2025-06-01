import dotenv from 'dotenv';

dotenv.config();

const ssoProviders_default = [
    {
        id: null,
        display_name: 'Google',
        api_name: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        authorizationURL: null,
        tokenURL: null,
    }
];

export default ssoProviders_default;