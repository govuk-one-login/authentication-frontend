import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { howDoYouWantSecurityCodesGet } from "./how-do-you-want-security-codes-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
  howDoYouWantSecurityCodesGet
);

export { router as howDoYouWantSecurityCodesRouter };
