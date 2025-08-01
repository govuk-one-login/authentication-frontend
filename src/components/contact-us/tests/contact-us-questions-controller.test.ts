import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import {
  contactUsQuestionsFormPostToSmartAgent,
  contactUsQuestionsGet,
} from "../contact-us-controller.js";
import {
  CONTACT_US_THEMES,
  CONTACT_US_FIELD_MAX_LENGTH,
  PATH_NAMES,
  CONTACT_US_COUNTRY_MAX_LENGTH,
} from "../../../app.constants.js";
import type { RequestGet, ResponseRedirect } from "../../../types.js";
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
              backurl: `${PATH_NAMES.CONTACT_US}?theme=${theme}`,
              referer: encodeURIComponent(REFERER),
              pageTitle: `pages.contactUsQuestions.${translationKey}.title`,
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
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
          translationKey: "accountCreation",
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
              referer: encodeURIComponent(REFERER),
              pageTitle: `pages.contactUsQuestions.${translationKey}.title`,
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
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
          translationKey: "anotherProblem",
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
              referer: encodeURIComponent(REFERER),
              pageTitle: `pages.contactUsQuestions.${translationKey}.title`,
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
            }
          );
        });
      });
    });

    describe("from /contact-us-further-information proving_identity", () => {
      [
        {
          radioButtonText: "Something else",
          subTheme: CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE,
          translationKey: "provingIdentitySomethingElse",
        },
      ].forEach(({ radioButtonText, subTheme, translationKey }) => {
        it(`should render ${PATH_NAMES.CONTACT_US_QUESTIONS} if '${radioButtonText}' radio option as chosen`, () => {
          req.query.theme = CONTACT_US_THEMES.PROVING_IDENTITY;
          req.query.subtheme = subTheme;
          req.headers.referer = REFERER;
          req.query.referer = REFERER;
          req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
          contactUsQuestionsGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "contact-us/questions/index.njk",
            {
              formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
              theme: CONTACT_US_THEMES.PROVING_IDENTITY,
              subtheme: subTheme,
              backurl: `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${CONTACT_US_THEMES.PROVING_IDENTITY}`,
              referer: encodeURIComponent(REFERER),
              pageTitle: `pages.contactUsQuestions.${translationKey}.title`,
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
            }
          );
        });
      });
    });

    describe("from /contact-us-further-information wallet", () => {
      [
        {
          radioButtonText: "You had a problem opening the GOV.UK One Login app",
          subTheme: CONTACT_US_THEMES.WALLET_PROBLEM_OPENING_APP,
          translationKey: "walletProblemOpeningApp",
        },
        {
          radioButtonText:
            "You had a problem adding your Veteran Card to the GOV.UK One Login app",
          subTheme:
            CONTACT_US_THEMES.WALLET_PROBLEM_ADDING_CREDENTIALS_DOCUMENT,
          translationKey: "walletProblemAddingCredentialsDocument",
        },
        {
          radioButtonText:
            "You had a problem viewing your Veteran Card in the GOV.UK One Login app",
          subTheme:
            CONTACT_US_THEMES.WALLET_PROBLEM_VIEWING_CREDENTIALS_DOCUMENT,
          translationKey: "walletProblemViewingCredentialsDocument",
        },
        {
          radioButtonText:
            "There was a technical problem (for example you saw an error message)",
          subTheme: CONTACT_US_THEMES.WALLET_TECHNICAL_PROBLEM,
          translationKey: "walletTechnicalProblem",
        },
        {
          radioButtonText: "Something else",
          subTheme: CONTACT_US_THEMES.WALLET_SOMETHING_ELSE,
          translationKey: "walletSomethingElse",
        },
      ].forEach(({ radioButtonText, subTheme, translationKey }) => {
        it(`should render ${PATH_NAMES.CONTACT_US_QUESTIONS} if '${radioButtonText}' radio option as chosen`, () => {
          req.query.theme = CONTACT_US_THEMES.WALLET;
          req.query.subtheme = subTheme;
          req.headers.referer = REFERER;
          req.query.referer = REFERER;
          req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
          contactUsQuestionsGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "contact-us/questions/index.njk",
            {
              formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
              theme: CONTACT_US_THEMES.WALLET,
              subtheme: subTheme,
              backurl: `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${CONTACT_US_THEMES.WALLET}`,
              referer: encodeURIComponent(REFERER),
              pageTitle: `pages.contactUsQuestions.${translationKey}.title`,
              pageTitleHeading: `pages.contactUsQuestions.${translationKey}.title`,
              contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
              contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
              appErrorCode: "",
              appSessionId: "",
            }
          );
        });
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
