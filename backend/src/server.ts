import express from "express";
import passport from 'passport';
import configurePassport from './auth/passportConfig';
import session from 'express-session';
import API_ROUTER from "./routes/apiRouter";

const APP = express();
const PORT = 5000;
APP.use(express.json());

try {
  configurePassport(passport);
} catch (error) {
  console.error("Error configuring passport: Run 'npm run seed' in ./backend to fill sso_providers table", error);
}

APP.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
}));

APP.use(passport.initialize());
APP.use(passport.session());

APP.use("/", API_ROUTER);

APP.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

