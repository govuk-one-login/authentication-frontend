import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  contactUsQuestionsFormPostToSmartAgent,
  contactUsQuestionsGet,
} from "../contact-us-controller";
import {
  CONTACT_US_THEMES,
  CONTACT_US_FIELD_MAX_LENGTH,
  PATH_NAMES,
  CONTACT_US_COUNTRY_MAX_LENGTH,
} from "../../../app.constants";
import { RequestGet, ResponseRedirect } from "../../../types";

describe("contact us questions controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "http://localhost:3000/enter-email";
  const REFERER_HEADER = "http://localhost/contact-us-further-information";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      query: {},
      get: sandbox.fake() as unknown as RequestGet,
      headers: {},
      t: sandbox.fake(),
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake() as unknown as ResponseRedirect,
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /contact-us-questions", () => {
    describe("from /contact-us", () => {
      [
        {
          radioButtonText: "GOV.UK email subscriptions",
          theme: CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS,
          translationKey: "emailSubscriptions",
        },
        {
          radioButtonText: "...somebody else is using your information...",
          theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
          translationKey: "suspectUnauthorisedAccess",
        },
        {
          radioButtonText: "Another problem using your GOV.UK One Login",
          theme: CONTACT_US_THEMES.SOMETHING_ELSE,
          translationKey: "anotherProblem",
        },
        {
          radioButtonText: "A suggestion or feedback...",
          theme: CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
          translationKey: "suggestionOrFeedback",
        },
      ].forEach(({ radioButtonText, theme, translationKey }) => {
        it(`should render ${PATH_NAMES.CONTACT_US_QUESTIONS} if '${radioButtonText}' radio option as chosen`, () => {
          req.query.theme = theme;
          req.headers.referer = REFERER;
          req.query.referer = REFERER;
          req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
          contactUsQuestionsGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "contact-us/questions/index.njk",
            {
              formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
              theme: theme,
              subtheme: undefined,
              backurl: `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${theme}`,
              supportMfaResetWithIpv: false,
              referer: encodeURIComponent(REFERER),
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
              contentId: "",
            }
          );
        });
      });

      it("should redirect to contact-us when no theme is present in request", () => {
        req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
        contactUsQuestionsGet(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith("/contact-us");
      });
    });

    describe("from /contact-us-further-information account_creation", () => {
      [
        {
          radioButtonText: "You did not get a security code",
          subTheme: CONTACT_US_THEMES.NO_SECURITY_CODE,
          translationKey: "noSecurityCode",
        },
        {
          radioButtonText: "The security code did not work",
          subTheme: CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          translationKey: "invalidSecurityCode",
        },
        {
          radioButtonText: "You had another problem with a phone number",
          subTheme: CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
          translationKey: "signInPhoneNumberIssue",
        },
        {
          radioButtonText: "You had a problem with an authenticator app",
          subTheme: CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
          translationKey: "authenticatorApp",
        },
        {
          radioButtonText: "There was a technical problem...",
          subTheme: CONTACT_US_THEMES.TECHNICAL_ERROR,
          translationKey: "technicalError",
        },
        {
          radioButtonText: "Something else",
          subTheme: CONTACT_US_THEMES.SOMETHING_ELSE,
          translationKey: "accountCreation", // TODO - AUT-4118 - I think this should be accountCreationProblem instead
        },
      ].forEach(({ radioButtonText, subTheme, translationKey }) => {
        it(`should render ${PATH_NAMES.CONTACT_US_QUESTIONS} if '${radioButtonText}' radio option as chosen`, () => {
          req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
          req.query.subtheme = subTheme;
          req.headers.referer = REFERER_HEADER;
          req.query.referer = REFERER;
          req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
          contactUsQuestionsGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "contact-us/questions/index.njk",
            {
              formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
              theme: CONTACT_US_THEMES.ACCOUNT_CREATION,
              subtheme: subTheme,
              backurl: `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
              supportMfaResetWithIpv: false,
              referer: encodeURIComponent(REFERER),
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
              contentId: "",
            }
          );
        });
      });
    });

    describe("from /contact-us-further-information signing_in", () => {
      [
        {
          radioButtonText: "You did not get a security code",
          subTheme: CONTACT_US_THEMES.NO_SECURITY_CODE,
          translationKey: "noSecurityCode",
        },
        {
          radioButtonText: "The security code did not work",
          subTheme: CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          translationKey: "invalidSecurityCode",
        },
        {
          radioButtonText: "You've forgotten your password",
          subTheme: CONTACT_US_THEMES.FORGOTTEN_PASSWORD,
          translationKey: "forgottenPassword",
        },
        {
          radioButtonText: "You've changed your phone number...",
          subTheme: CONTACT_US_THEMES.NO_PHONE_NUMBER_ACCESS,
          translationKey: "noPhoneNumberAccess",
        },
        {
          radioButtonText: "...GOV.UK One Login 'cannot be found'",
          subTheme: CONTACT_US_THEMES.ACCOUNT_NOT_FOUND,
          translationKey: "accountNotFound",
        },
        {
          radioButtonText: "There was a technical problem...",
          subTheme: CONTACT_US_THEMES.TECHNICAL_ERROR,
          translationKey: "technicalError",
        },
        {
          radioButtonText: "Something else",
          subTheme: CONTACT_US_THEMES.SOMETHING_ELSE,
          translationKey: "anotherProblem", // TODO - AUT-4118 - I think this should be signignInProblem instead (yes, with the typo)
        },
      ].forEach(({ radioButtonText, subTheme, translationKey }) => {
        it(`should render ${PATH_NAMES.CONTACT_US_QUESTIONS} if '${radioButtonText}' radio option as chosen`, () => {
          req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
          req.query.subtheme = subTheme;
          req.headers.referer = REFERER_HEADER;
          req.query.referer = REFERER;
          req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
          contactUsQuestionsGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "contact-us/questions/index.njk",
            {
              formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
              theme: CONTACT_US_THEMES.SIGNING_IN,
              subtheme: subTheme,
              backurl: `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
              supportMfaResetWithIpv: false,
              referer: encodeURIComponent(REFERER),
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
              contentId: "",
            }
          );
        });
      });
    });

    // TODO - AUT-4118 - Make this, and other, tests check if content has been rendered to the page
    it("should render contact-us-questions if a 'A problem proving your identity' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.PROVING_IDENTITY;
      req.headers.referer = REFERER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "proving_identity",
        subtheme: undefined,
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.PROVING_IDENTITY}`,
        supportMfaResetWithIpv: false,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.provingIdentity.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
  });

  describe("POST /contact-us-questions", () => {
    it("should redirect /contact-us-submit-success page when ticket posted", async () => {
      const fakeService = {
        contactUsSubmitFormSmartAgent: sandbox.fake(),
      };

      await contactUsQuestionsFormPostToSmartAgent(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/contact-us-submit-success");
    });
  });
});
