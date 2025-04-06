import passport from 'passport';

import db from '../database/db';

import dotenv from 'dotenv';
import createGoogleStrategy from './googleAuthStrategy';

dotenv.config();

export async function configurePassport() {

  passport.use(await createGoogleStrategy());

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

export default passport;