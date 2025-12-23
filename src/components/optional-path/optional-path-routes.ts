import type { Request, Response } from "express";
import express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";

const router = express.Router();

const optionalPathGet = async (req: Request, res: Response) => {
  const event = req.query.event as string;
  const nextPath = await getNextPathAndUpdateJourney(req, res, event, req.session.user.journey.nextPath);

  res.redirect(nextPath);
};

router.get(
  "/optional-path",
  validateSessionMiddleware,
  // allowUserJourneyMiddleware,
  optionalPathGet
);

export { router as optionalPathRouter };