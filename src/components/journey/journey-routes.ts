import express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";

const router = express.Router()

const journeyGet = async( req: Request, res: Response)=>  {
  const previousPage = `/${req.params.page}`
  const event = req.params.event
  const nextPath = await getNextPathAndUpdateJourney(req, res, event, previousPage);
  res.redirect(nextPath);
}

router.get(
  "/journey/:page/:event",
  validateSessionMiddleware,
  journeyGet
)

export {router as journeyRouter}