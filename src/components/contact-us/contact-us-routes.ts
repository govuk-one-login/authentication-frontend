import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  contactUsGet,
  contactUsSubmitSuccessGet,
  contactUsFormPost,
} from "./contact-us-controller";
import { asyncHandler } from "../../utils/async";
import { validateContactUsRequest } from "./contact-us-validation";

const router = express.Router();

router.get(PATH_NAMES.CONTACT_US, contactUsGet);
router.get(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS, contactUsSubmitSuccessGet);

router.post(
  PATH_NAMES.CONTACT_US,
  validateContactUsRequest(),
  asyncHandler(contactUsFormPost())
);

export { router as contactUsRouter };
