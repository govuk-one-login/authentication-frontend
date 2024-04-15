import { doubleCsrf } from "csrf-csrf";
import express from "express";

const crypto = require('crypto');


const {
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  cookieName: '_csrf',
  cookieOptions: {
    secure: true,
  },
  getSecret: () => crypto.randomBytes(32).toString('hex'),
  getTokenFromRequest: req => req.body.csrfToken,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"]
});

const configureCSRF = (app: express.Application) => {
  app.use(doubleCsrfProtection);
  app.use((req, res, next) => {
    res.locals.csrfToken = generateToken(req, res);

    next();
  });
};

// export default configureCSRF;