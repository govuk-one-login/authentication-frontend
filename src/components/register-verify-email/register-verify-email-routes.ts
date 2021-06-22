import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";
import {
  registerVerifyEmailGet,
  registerVerifyEmailPost,
} from "./register-verify-email-controller";
import { validateVerifyEmailRequest } from "./register-verify-email-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  basicMiddlewarePipeline,
  registerVerifyEmailGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  basicMiddlewarePipeline,
  validateVerifyEmailRequest(),
  registerVerifyEmailPost
);

export { router as registerVerifyEmailRouter };
