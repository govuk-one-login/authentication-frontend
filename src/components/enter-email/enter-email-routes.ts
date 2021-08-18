import { PATH_NAMES } from "../../app.constants";
import { validateEnterEmailRequest } from "./enter-email-validation";
import { enterEmailPost, enterEmailGet, enterEmailCreateAccountGet, enterEmailExistingAccountGet } from "./enter-email-controller";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get("/", validateSessionMiddleware, enterEmailGet);

router.get(PATH_NAMES.ENTER_EMAIL, validateSessionMiddleware, enterEmailGet);

router.get("/enter-email-create-account", validateSessionMiddleware, enterEmailCreateAccountGet);
router.get("/enter-email-existing-account", validateSessionMiddleware, enterEmailExistingAccountGet);

router.post(
  PATH_NAMES.ENTER_EMAIL,
  validateSessionMiddleware,
  validateEnterEmailRequest(),
  asyncHandler(enterEmailPost())
);

export { router as enterEmailRouter };
