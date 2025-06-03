// THIS IS FOR DEV TESTING ONLY

import express from "express";
import pino from "pino";

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

if (stubUrl === undefined) {
  logger.warn(
    `Warning: No orch stub configured for environment ${process.env.DEPLOYMENT_NAME}`
  );
}

app.get("/", async (req, res) => {
  if (stubUrl === undefined) {
    res.send(
      "No orchestration stub url defined for this environment. You may want to use the RP stub at localhost:2000 instead. " +
        `Currently, this stub is for environments configured for the orchestration stub (${Object.keys(stubUrls).join(", ")})`
    );
  }

  const channel = req.query.channel || "none";

  return res.redirect(
    `${stubUrl}?auto-submit=yes&level=Cl.Cm&authenticated=no&channel=${channel}`
  );
});

app.listen(port, () => {
  logger.info("TEST APP TO REDIRECT FOR NEW SESSION : DEV ONLY");
  logger.info(`RUNNING ON http://localhost:${port}`);
  logger.info(`FRONTEND PORT: ${frontendPort}`);
});
