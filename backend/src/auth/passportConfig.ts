import db from '../database/db';
import createAuthStrategy from './AuthStrategy';
import { PassportStatic } from 'passport';
import SSOProvider from 'database/SSOProvider';
import createGoogleStrategy from './googleAuthStrategy';


async function configurePassport(passport: PassportStatic) {

  const GOOGLE_API_NAME = "google";

  const ssoProviders: SSOProvider[] = await db.sso_providers.findAll();

  if (!ssoProviders || ssoProviders.length === 0) {
    throw new Error("No SSO providers found in the database.");
  }

  for (const ssoProvider of ssoProviders) { // Ostavio sam Google da koristi GoogleStrategy, a ostale da koriste genericki AuthStrategy
    if (ssoProvider.api_name === GOOGLE_API_NAME) {
      passport.use("google", await createGoogleStrategy());
    } else {
      passport.use(ssoProvider.api_name, await createAuthStrategy(ssoProvider));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}


export default configurePassport;