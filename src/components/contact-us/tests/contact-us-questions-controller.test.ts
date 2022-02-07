import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { contactUsQuestionsGet } from "../contact-us-controller";
import { ZENDESK_THEMES } from "../../../app.constants";

describe("contact us questions controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, query: {}, get: sandbox.fake(), headers: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("contactUsQuestionsGetFromContactUsPage", () => {
    it("should render contact-us-questions if a 'another problem using your account' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = "/contact-us";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "something_else",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
      });
    });
    it("should render contact-us-questions if a 'GOV.UK email subscriptions' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS;
      req.headers.referer = "/contact-us";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "email_subscriptions",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.emailSubscriptions.title",
      });
    });
    it("should render contact-us-questions if a 'A suggestion or feedback' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SUGGESTIONS_FEEDBACK;
      req.headers.referer = "/contact-us";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "suggestions_feedback",
        subtheme: undefined,
        backurl: "/contact-us",
        pageTitleHeading: "pages.contactUsQuestions.suggestionOrFeedback.title",
      });
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationSigningInPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "no_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "invalid_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
      });
    });
    it("should render contact-us-questions if a 'You do not have access to the phone number' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.NO_PHONE_NUMBER_ACCESS;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "no_phone_number_access",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noPhoneNumberAccess.title",
      });
    });
    it("should render contact-us-questions if a 'You've forgotten your password' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.FORGOTTEN_PASSWORD;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "forgotten_password",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.forgottenPassword.title",
      });
    });
    it("should render contact-us-questions if a 'Your account cannot be found' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.ACCOUNT_NOT_FOUND;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "account_not_found",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.accountNotFound.title",
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "technical_error",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "something_else",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
      });
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationAccountCreationPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "no_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "invalid_security_code",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
      });
    });
    it("should render contact-us-questions if a 'You do not have a UK number' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.NO_UK_MOBILE_NUMBER;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "no_uk_mobile_number",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.noUKMobile.title",
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "technical_error",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = "/contact-us-further-information";
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "something_else",
        backurl: "/contact-us-further-information",
        pageTitleHeading: "pages.contactUsQuestions.accountCreation.title",
      });
    });
  });
});
