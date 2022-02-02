import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  contactUsGet,
  contactUsSubmitSuccessGet,
  contactUsFormPost,
  furtherInformationGet,
  contactUsQuestionsGet,
} from "./contact-us-controller";
import { validateContactUsRequest } from "./contact-us-validation";

const router = express.Router();

router.get(PATH_NAMES.CONTACT_US, contactUsGet);
router.post(
  PATH_NAMES.CONTACT_US,
  validateContactUsRequest(),
  contactUsFormPost
);
router.get(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS, contactUsSubmitSuccessGet);
router.get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION, furtherInformationGet);
router.get(PATH_NAMES.CONTACT_US_QUESTIONS, contactUsQuestionsGet);

export { router as contactUsRouter };
