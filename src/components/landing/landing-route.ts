import { initialiseSessionMiddleware } from "../../middleware/session-middleware";
import * as express from "express";
import { landingGet } from "./landing-controller";

const router = express.Router();

router.get("/", initialiseSessionMiddleware, landingGet);

export { router as landingRouter };
