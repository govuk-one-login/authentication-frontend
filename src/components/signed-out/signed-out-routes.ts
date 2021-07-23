import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  signedOutGet,
} from "./signed-out-controller";

const router = express.Router();

router.get(
  PATH_NAMES.SIGNED_OUT,
  signedOutGet
);

export { router as signedOutRouter };
