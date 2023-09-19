import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  contactUsGet,
  contactUsSubmitSuccessGet,
  contactUsFormPost,
  furtherInformationGet,
  contactUsQuestionsGet,
  furtherInformationPost,
  contactUsQuestionsFormPostToZendesk,
  contactUsQuestionsFormPostToSmartAgent,
} from "./contact-us-controller";
import { validateContactUsRequest } from "./contact-us-validation";
import { validateContactUsQuestionsRequest } from "./contact-us-questions-validation";
import { asyncHandler } from "../../utils/async";
import { supportSmartAgent } from "../../config";

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

if (supportSmartAgent()) {
  router.post(
    PATH_NAMES.CONTACT_US_QUESTIONS,
    validateContactUsQuestionsRequest(),
    asyncHandler(contactUsQuestionsFormPostToSmartAgent())
  );
} else {
  router.post(
    PATH_NAMES.CONTACT_US_QUESTIONS,
    validateContactUsQuestionsRequest(),
    asyncHandler(contactUsQuestionsFormPostToZendesk())
  );
}

router.get(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS, contactUsSubmitSuccessGet);

export { router as contactUsRouter };
