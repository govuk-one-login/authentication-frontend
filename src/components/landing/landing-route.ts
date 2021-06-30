import {
  createSessionMiddleware,
  validateSessionMiddleware,
} from "../../middleware/session-middleware";
import * as express from "express";
import { landingGet } from "./landing-controller";

const router = express.Router();

router.get("/", createSessionMiddleware, validateSessionMiddleware, landingGet);

export { router as landingRouter };
