// THIS IS FOR DEV TESTING ONLY

import express from "express";
import pino from "pino";
import { default as axios } from "axios";
import url from "url";

const stubUrls = {
  authdev2: "https://orchstub-authdev2.signin.dev.account.gov.uk",
  authdev1: "https://orchstub-authdev1.signin.dev.account.gov.uk",
  dev: "https://orchstub.signin.dev.account.gov.uk",
};

import dotenv from "dotenv";
dotenv.config();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();
const port = process.env.PORT || 3002;
const frontendPort = process.env.FRONTEND_PORT || 3000;
const stubUrl = stubUrls[process.env.DEPLOYMENT_NAME];
const sessionExpiry = Number(process.env.SESSION_EXPIRY || 3600000);

if (stubUrl === undefined) {
  logger.warn(
    `Warning: No orch stub configured for environment ${process.env.DEPLOYMENT_NAME}`
  );
}

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
      maxAge: sessionExpiry,
    });
  }
};

const setLngCookie = (orchStubResponse, res) => {
  let lngCookieValue;
  const lngCookie = orchStubResponse.headers["set-cookie"][2];
  if (lngCookie) {
    lngCookieValue = getCookieValue(lngCookie.split(";"), "lng");
    res.cookie("lng", lngCookieValue, {
      maxAge: sessionExpiry,
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
  if (stubUrl === undefined) {
    res.send(
      "No orchestration stub url defined for this environment. You may want to use the RP stub at localhost:2000 instead. " +
        `Currently, this stub is for environments configured for the orchestration stub (${Object.keys(stubUrls).join(", ")})`
    );
  }
  const channel = req.query.channel || "none";
  // call orch stub
  const orchStubResponse = await axios.post(
    stubUrl,
    `reauthenticate=&level=Cl.Cm&authenticated=no&authenticatedLevel=Cl.Cm&channel=${channel}`,
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
