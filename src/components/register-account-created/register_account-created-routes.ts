import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  registerAccountCreatedGet,
  registerAccountCreatedPost,
} from "./register-account-created-controller";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  basicMiddlewarePipeline,
  registerAccountCreatedGet
);
router.post(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  basicMiddlewarePipeline,
  registerAccountCreatedPost
);

export { router as registerAccountCreatedRouter };
