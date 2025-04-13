import db from '../database/db';
import createAuthStrategy from './AuthStrategy';
import { PassportStatic } from 'passport';
import SSOProvider from 'database/SSOProvider';


async function configurePassport(passport: PassportStatic) {

  const ssoProviders: SSOProvider[] = await db.sso_providers.findAll();

  if (!ssoProviders || ssoProviders.length === 0) {
    throw new Error("No SSO providers found in the database.");
  }
  
  for (const ssoProvider of ssoProviders) {
    passport.use(ssoProvider.name, await createAuthStrategy(ssoProvider));
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