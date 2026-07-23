import express from "express";
import {
  createPasskeyGet,
  createPasskeyPost,
} from "./create-passkey-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.CREATE_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountInterventionsMiddleware(
    {
      handleSuspendedStatus: true,
      handlePasswordResetStatus: true,
      handleReproveIdentity: true,
      onRedirect: (req) =>
        (req.session.user.accountInterventionAppliedDuringPasskeyRegistration = true),
    },
    true
  ),
  createPasskeyGet
);

router.post(
  PATH_NAMES.CREATE_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  createPasskeyPost()
);

export { router as createPasskeyRouter };
