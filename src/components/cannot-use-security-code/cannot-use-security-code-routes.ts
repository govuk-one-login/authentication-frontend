import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { cannotUseSecurityCodeGet } from "./cannot-use-security-code-controller.js";

const router = express.Router();

router.get(PATH_NAMES.CANNOT_USE_SECURITY_CODE, cannotUseSecurityCodeGet);

export { router as cannotUseSecurityCodeRouter };
