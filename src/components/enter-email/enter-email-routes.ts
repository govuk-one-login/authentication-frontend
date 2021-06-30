import { PATH_NAMES } from "../../app.constants";
import { createSessionMiddleware } from "../../middleware/session-middleware";
import { validateEnterEmailRequest } from "./enter-email-validation";
import { enterEmailPost, enterEmailGet } from "./enter-email-controller";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  "/",
  createSessionMiddleware,
  validateSessionMiddleware,
  enterEmailGet
);

router.get(PATH_NAMES.ENTER_EMAIL, validateSessionMiddleware, enterEmailGet);

router.post(
  PATH_NAMES.ENTER_EMAIL,
  validateSessionMiddleware,
  validateEnterEmailRequest(),
  enterEmailPost()
);

export { router as enterEmailRouter };
