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

  describe("contactUsQuestionsGetFromContactUsPage", () => {
    it("should render contact-us-questions if a 'another problem using your account' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SOMETHING_ELSE;
      req.headers.referer = REFERER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "something_else",
        subtheme: undefined,
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SOMETHING_ELSE}`,
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
        referer: encodeURIComponent(REFERER),
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'GOV.UK email subscriptions' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS;
      req.headers.referer = REFERER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "email_subscriptions",
        subtheme: undefined,
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.emailSubscriptions.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'A suggestion or feedback' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK;
      req.headers.referer = REFERER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "suggestions_feedback",
        subtheme: undefined,
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.suggestionOrFeedback.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });

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
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.provingIdentity.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });

    it("should redirect to contact-us when no theme is present in request", () => {
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/contact-us");
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationSigningInPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.NO_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "no_security_code",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "invalid_security_code",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'You do not have access to the phone number' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.NO_PHONE_NUMBER_ACCESS;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "no_phone_number_access",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.noPhoneNumberAccess.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'You've forgotten your password' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.FORGOTTEN_PASSWORD;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "forgotten_password",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.forgottenPassword.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'Your account cannot be found' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.ACCOUNT_NOT_FOUND;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "account_not_found",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.accountNotFound.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.TECHNICAL_ERROR;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "technical_error",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.subtheme = CONTACT_US_THEMES.SOMETHING_ELSE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "signing_in",
        subtheme: "something_else",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationAccountCreationPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = CONTACT_US_THEMES.NO_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "account_creation",
        subtheme: "no_security_code",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = CONTACT_US_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "account_creation",
        subtheme: "invalid_security_code",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'You have another problem with a phone number' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "account_creation",
        subtheme: "sign_in_phone_number_issue",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading:
          "pages.contactUsQuestions.signInPhoneNumberIssue.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = CONTACT_US_THEMES.TECHNICAL_ERROR;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "account_creation",
        subtheme: "technical_error",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = CONTACT_US_THEMES.SOMETHING_ELSE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "account_creation",
        subtheme: "something_else",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.accountCreation.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });
    it("should render contact-us-questions if a 'problem with authenticator app' radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
        theme: "account_creation",
        subtheme: "authenticator_app_problem",
        backurl: `/contact-us-further-information?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
        referer: encodeURIComponent(REFERER),
        pageTitleHeading: "pages.contactUsQuestions.authenticatorApp.title",
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
        appErrorCode: "",
        appSessionId: "",
        contentId: "",
      });
    });

    describe("contactUsFormPost", () => {
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
});
