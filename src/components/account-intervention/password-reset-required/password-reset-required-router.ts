import { PATH_NAMES } from "../../../app.constants";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware";
import { passwordResetRequiredGet } from "./password-reset-required-controller";

const router = express.Router();

router.get(
  PATH_NAMES.PASSWORD_RESET_REQUIRED,
  validateSessionMiddleware,
  passwordResetRequiredGet
);

export { router as accountInterventionRouter };
