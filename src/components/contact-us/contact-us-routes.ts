import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  contactUsGet,
  contactUsSubmitSuccessGet,
  contactUsFormPost,
  furtherInformationGet,
  contactUsQuestionsGet,
  furtherInformationPost,
  contactUsQuestionsFormPostToSmartAgent,
  contactUsGetFromTriagePage,
} from "./contact-us-controller.js";
import { validateContactUsRequest } from "./validation/contact-us-validation.js";
import { validateContactUsQuestionsRequest } from "./validation/contact-us-questions-validation.js";
import { validateContactUsFurtherInformationRequest } from "./validation/contact-us-further-information-validation.js";

const router = express.Router();

router.get(PATH_NAMES.CONTACT_US, contactUsGet);
router.get(PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE, contactUsGetFromTriagePage);
router.post(
  PATH_NAMES.CONTACT_US,
  validateContactUsRequest("contact-us/index-public-contact-us.njk", "theme"),
  contactUsFormPost
);

router.get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION, furtherInformationGet);
router.post(
  PATH_NAMES.CONTACT_US_FURTHER_INFORMATION,
  validateContactUsFurtherInformationRequest(
    "contact-us/further-information/index.njk",
    "subtheme"
  ),
  furtherInformationPost
);

router.get(PATH_NAMES.CONTACT_US_QUESTIONS, contactUsQuestionsGet);

router.post(
  PATH_NAMES.CONTACT_US_QUESTIONS,
  validateContactUsQuestionsRequest(),
  contactUsQuestionsFormPostToSmartAgent()
);

router.get(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS, contactUsSubmitSuccessGet);

export { router as contactUsRouter };
