import { PATH_NAMES } from "../../app.constants";
import { createSessionMiddleware } from "../../middleware/session-middleware";
import { validateEnterEmailRequest } from "./enter-email-validation";
import { enterEmailPost, enterEmailGet } from "./enter-email-controller";
import * as express from "express";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";

const router = express.Router();

router.get(
  "/",
  createSessionMiddleware,
  basicMiddlewarePipeline,
  enterEmailGet
);

router.get(PATH_NAMES.ENTER_EMAIL, basicMiddlewarePipeline, enterEmailGet);

router.post(
  PATH_NAMES.ENTER_EMAIL,
  basicMiddlewarePipeline,
  validateEnterEmailRequest(),
  enterEmailPost()
);

export { router as enterEmailRouter };
