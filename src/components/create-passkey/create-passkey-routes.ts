import express from "express";
import { createPasskeyGet } from "./create-passkey-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
const router = express.Router();

//TODO middleware
router.get(PATH_NAMES.CREATE_PASSKEY, createPasskeyGet);

export { router as createPasskeyRouter };
