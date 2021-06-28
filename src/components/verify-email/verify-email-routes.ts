import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";
import { verifyEmailGet, verifyEmailPost } from "./verify-email-controller";
import { validateVerifyEmailRequest } from "./verify-email-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  basicMiddlewarePipeline,
  verifyEmailGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  basicMiddlewarePipeline,
  validateVerifyEmailRequest(),
  verifyEmailPost()
);

export { router as verifyEmailRouter };
