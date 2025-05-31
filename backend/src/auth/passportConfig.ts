import DB from '../database';
import createAuthStrategy from './createAuthStrategy';
import { PassportStatic } from 'passport';
import SSOProvider from 'modules/SSOProvider/SSOProvider.model';
import createGoogleStrategy from './SpecificAuthStrategies/GoogleAuthStrategy';
import { GOOGLE_API_NAME } from './SpecificAuthStrategies/GoogleAuthStrategy';
import createBitbucketStrategy from './SpecificAuthStrategies/BitbucketAuthStrategy';
import { BITBUCKET_API_NAME } from './SSO_DEFAULTS';


async function configurePassport(passport: PassportStatic) {


  const ssoProviders: SSOProvider[] = await DB.sso_providers.findAll();

  if (!ssoProviders || ssoProviders.length === 0) {
    throw new Error("No SSO providers found in the database.");
  }

  for (const ssoProvider of ssoProviders) { // Ostavio sam Google da koristi GoogleStrategy, a ostale da koriste genericki AuthStrategy

    console.log("Creating Auth Strategy for SSO Provider:", ssoProvider.api_name);

    if (ssoProvider.api_name === GOOGLE_API_NAME) {
      passport.use(GOOGLE_API_NAME, await createGoogleStrategy());

    } else if (ssoProvider.api_name === BITBUCKET_API_NAME) {
      passport.use(BITBUCKET_API_NAME, await createBitbucketStrategy());

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
      const user = await DB.admin_users.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}


export default configurePassport;