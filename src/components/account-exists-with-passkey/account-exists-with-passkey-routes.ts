import { PATH_NAMES } from "../../app.constants.js";
import { Router } from "express";
import { getAccountExistsWithPasskey } from "./account-exists-with-passkey-controller.js";

const router = Router();

router.get(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY, getAccountExistsWithPasskey);

export { router as accountExistsWithPasskeyRouter };
