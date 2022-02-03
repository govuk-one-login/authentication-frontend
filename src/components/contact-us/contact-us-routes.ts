import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  contactUsGet,
  contactUsSubmitSuccessGet,
  contactUsFormPost,
  furtherInformationGet,
  contactUsQuestionsGet,
  furtherInformationPost,
} from "./contact-us-controller";
import { validateContactUsRequest } from "./contact-us-validation";

const router = express.Router();

router.get(PATH_NAMES.CONTACT_US, contactUsGet);
router.post(
  PATH_NAMES.CONTACT_US,
  validateContactUsRequest("contact-us/index-public-contact-us.njk", "theme"),
  contactUsFormPost
);

router.get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION, furtherInformationGet);
router.post(
  PATH_NAMES.CONTACT_US_FURTHER_INFORMATION,
  validateContactUsRequest(
    "contact-us/further-information/index.njk",
    "subtheme"
  ),
  furtherInformationPost
);

router.get(PATH_NAMES.CONTACT_US_QUESTIONS, contactUsQuestionsGet);

router.get(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS, contactUsSubmitSuccessGet);

export { router as contactUsRouter };
