import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";
import {
  createPasswordGet,
  createPasswordPost,
} from "./register-create-password-controller";
import { validateCreatePasswordRequest } from "./register-create-password-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
  basicMiddlewarePipeline,
  createPasswordGet
);
router.post(
  PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
  basicMiddlewarePipeline,
  validateCreatePasswordRequest(),
  createPasswordPost()
);

export { router as registerCreatePasswordRouter };
