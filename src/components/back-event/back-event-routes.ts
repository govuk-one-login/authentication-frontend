import type { Request, Response } from "express";
import express from "express";
import { logger } from "../../utils/logger.js";

const router = express.Router();

router.get(
  "/back-event",
  // validateSessionMiddleware,
  // allowUserJourneyMiddleware,
  backEventGet
);

function backEventGet(req: Request, res: Response) {
  const previousPath = req.session.user.journey?.history?.slice(-1)[0] || "/";
  // req.session.user.journey.previousPath = previousPath;
  req.session.user.journey.history.pop();
  logger.info(`history cuz ${req.session.user.journey.history}`)
  return res.redirect(previousPath);
}

export { router };
