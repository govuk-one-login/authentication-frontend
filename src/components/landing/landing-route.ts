import * as express from "express";
import { landingGet } from "./landing-controller";
import { initialiseSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get("/", initialiseSessionMiddleware, landingGet);

export { router as landingRouter };
