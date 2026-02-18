import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import {
  changeSecurityCodesSignInGet,
  changeSecurityCodesSignInPost,
} from "./change-security-codes-sign-in-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN,
  changeSecurityCodesSignInGet
);

router.post(
  PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN,
  changeSecurityCodesSignInPost
);

export { router as changeSecurityCodesSignInRouter };
