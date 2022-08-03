import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  contactUsQuestionsFormPost,
  contactUsQuestionsGet,
} from "../contact-us-controller";
import { ZENDESK_THEMES } from "../../../app.constants";
import { ContactUsServiceInterface } from "../types";

describe("contact us questions controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "https://gov.uk/sign-in";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      query: {},
      get: sandbox.fake(),
      headers: {},
      t: sandbox.fake(),
    };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("contactUsQuestionsGetFromContactUsPage", () => {
    it("should render contact-us-questions if a 'another problem using your account' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = "/contact-us";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "something_else",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'GOV.UK email subscriptions' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS;
      req.headers.referer = "/contact-us";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "email_subscriptions",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.emailSubscriptions.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'A suggestion or feedback' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SUGGESTIONS_FEEDBACK;
      req.headers.referer = "/contact-us";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "suggestions_feedback",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.suggestionOrFeedback.title",
        referer: REFERER,
      });
    });

    it("should render contact-us-questions if a 'A problem proving your identity' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.PROVING_IDENTITY;
      req.headers.referer = "/contact-us";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "proving_identity",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.provingIdentity.title",
        referer: REFERER,
      });
    });

    it("should redirect to contact-us when no theme is present in request", () => {
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/contact-us");
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationSigningInPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "no_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "invalid_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'You do not have access to the phone number' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.NO_PHONE_NUMBER_ACCESS;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "no_phone_number_access",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noPhoneNumberAccess.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'You've forgotten your password' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.FORGOTTEN_PASSWORD;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "forgotten_password",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.forgottenPassword.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'Your account cannot be found' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.ACCOUNT_NOT_FOUND;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "account_not_found",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.accountNotFound.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "technical_error",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "something_else",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
        referer: REFERER,
      });
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationAccountCreationPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "no_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "invalid_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'You do not have a UK number' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.NO_UK_MOBILE_NUMBER;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "no_uk_mobile_number",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noUKMobile.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "technical_error",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "something_else",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.accountCreation.title",
        referer: REFERER,
      });
    });
    it("should render contact-us-questions if a 'problem with authenticator app' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM;
      req.headers.referer = "/contact-us-further-information";
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "authenticator_app_problem",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.authenticatorApp.title",
        referer: REFERER,
      });
    });

    describe("contactUsFormPost", () => {
      it("should redirect /contact-us-submit-success page when ticket posted", async () => {
        const fakeService: ContactUsServiceInterface = {
          contactUsSubmitForm: sandbox.fake(),
        };

        await contactUsQuestionsFormPost(fakeService)(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.calledWith("/contact-us-submit-success");
      });
    });
  });
});
