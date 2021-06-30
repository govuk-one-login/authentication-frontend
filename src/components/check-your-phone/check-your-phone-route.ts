import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";
import { PATH_NAMES } from "../../app.constants";
import express from "express";
import { checkYourPhoneGet } from "./check-your-phone-controller";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_PHONE,
  basicMiddlewarePipeline,
  checkYourPhoneGet
);

export { router as checkYourPhoneRouter };
