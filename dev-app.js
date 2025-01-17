// THIS IS FOR DEV TESTING ONLY

const express = require("express");
const pino = require("pino");
const axios = require("axios").default;
const url = require("url");
const { randomBytes } = require("crypto");

require("dotenv").config();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();
const port = process.env.PORT || 3001;
const frontend_port = process.env.FRONTEND_PORT || 3000;
const sessionExpiry = Number(process.env.SESSION_EXPIRY || 3600000);

function createAuthorizeRequest() {
  const vtr = process.env.VTR ? `vtr=${encodeURI(process.env.VTR)}&` : "";
  const ui_locales =
    process.env.UI_LOCALES && process.env.UI_LOCALES.length > 0
      ? `&ui_locales=${process.env.UI_LOCALES}`
      : "";
  const redirect_uri = `https://${process.env.STUB_HOSTNAME}/oidc/authorization-code/callback`;

  return new URL(
    "/authorize?" +
      vtr +
      "scope=openid+phone+email" +
      "&response_type=code" +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&state=${randomBytes(32).toString("base64url")}` +
      `&nonce=${randomBytes(32).toString("base64url")}` +
      `&client_id=${process.env.TEST_CLIENT_ID}` +
      "&cookie_consent=accept" +
      "&_ga=test" +
      ui_locales,
    process.env.API_BASE_URL
  ).toString();
}

app.get("/", (req, res) => {
  const authRequest = createAuthorizeRequest();
  logger.info(`Built OIDC URL: ${authRequest}`);
  axios
    .get(authRequest, {
      validateStatus: (status) => {
        return status >= 200 && status <= 304;
      },
      maxRedirects: 0,
    })
    .then(function (response) {
      let sessionCookieValue;
      const sessionCookie = response.headers["set-cookie"][0];
      if (sessionCookie) {
        sessionCookieValue = getCookieValue(sessionCookie.split(";"), "gs");
        res.cookie("gs", sessionCookieValue, {
          maxAge: sessionExpiry,
        });
      }

      let lngCookieValue;
      const lngCookie = response.headers["set-cookie"][2];
      if (lngCookie) {
        lngCookieValue = getCookieValue(lngCookie.split(";"), "lng");
        res.cookie("lng", lngCookieValue, {
          maxAge: sessionExpiry,
        });
      }

      logger.info(`Session is: ${sessionCookieValue}`);
      logger.info(`lng is: ${lngCookieValue}`);

      const location = url.parse(response.headers.location, true);
      logger.info(`orch response location is: ${location}`);

      const params = new URLSearchParams(location.query);
      // logger.info(`params: ${params}`);
      const redirectUri = new URL(
        `http://localhost:${frontend_port}/authorize`
      );
      redirectUri.search = params.toString();

      logger.info(`orch response location query is: ${redirectUri.toString()}`);
      logger;
      res.redirect(redirectUri);
    })
    .catch(function (error) {
      logger.error(error, "Error in OIDC request");
    });
});

app.listen(port, () => {
  logger.info("TEST APP TO REDIRECT FOR NEW SESSION : DEV ONLY");
  logger.info(`RUNNING ON http://localhost:${port}`);
  logger.info(`FRONTEND PORT: ${frontend_port}`);
});

function getCookieValue(cookie, cookieName) {
  let value;
  cookie.forEach((item) => {
    const name = item.split("=")[0].toLowerCase().trim();
    if (name.indexOf(cookieName) !== -1) {
      value = item.split("=")[1];
    }
  });
  return value;
}
