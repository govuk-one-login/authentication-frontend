// THIS IS FOR DEV TESTING ONLY

const express = require("express");
const pino = require("pino");
const axios = require("axios").default;
const url = require("url");

require("dotenv").config();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();
const port = process.env.PORT || 3002;
const frontendPort = process.env.FRONTEND_PORT || 3000;
const stub_url =
  process.env.STUB_URL || "https://orchstub-authdev1.signin.dev.account.gov.uk";

const getCookieValue = (cookie, cookieName) => {
  let value;
  cookie.forEach((item) => {
    const name = item.split("=")[0].toLowerCase().trim();
    if (name.indexOf(cookieName) !== -1) {
      value = item.split("=")[1];
    }
  });
  return value;
};

const setGsCookie = (orchStubResponse, res) => {
  let sessionCookieValue;
  const sessionCookie = orchStubResponse.headers["set-cookie"][0];
  if (sessionCookie) {
    sessionCookieValue = getCookieValue(sessionCookie.split(";"), "gs");
    res.cookie("gs", sessionCookieValue, {
      maxAge: new Date(new Date().getTime() + 60 * 60000),
    });
  }
};

const setLngCookie = (orchStubResponse, res) => {
  let lngCookieValue;
  const lngCookie = orchStubResponse.headers["set-cookie"][2];
  if (lngCookie) {
    lngCookieValue = getCookieValue(lngCookie.split(";"), "lng");
    res.cookie("lng", lngCookieValue, {
      maxAge: new Date(new Date().getTime() + 60 * 60000),
    });
  }
};

const buildRedirectURL = (response) => {
  const location = url.parse(response.headers.location, true);
  logger.info(`orch response location is: ${JSON.stringify(location)}`);

  const params = new URLSearchParams(location.query);
  const redirectUri = new URL(`http://localhost:${frontendPort}/authorize`);
  redirectUri.search = params.toString();
  return redirectUri;
};

app.get("/", async (req, res) => {
  // call orch stub
  const orchStubResponse = await axios.post(
    stub_url,
    "reauthenticate=&level=Cl.Cm&authenticated=no&authenticatedLevel=Cl.Cm&channel=none",
    {
      validateStatus: (status) => {
        return status === 302;
      },
      maxRedirects: 0,
    }
  );

  setGsCookie(orchStubResponse, res);
  setLngCookie(orchStubResponse, res);
  const redirectUrl = buildRedirectURL(orchStubResponse);
  res.redirect(redirectUrl.toString());
});

app.listen(port, () => {
  logger.info("TEST APP TO REDIRECT FOR NEW SESSION : DEV ONLY");
  logger.info(`RUNNING ON http://localhost:${port}`);
  logger.info(`FRONTEND PORT: ${frontendPort}`);
});
