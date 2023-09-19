import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  contactUsQuestionsFormPostToZendesk,
  contactUsQuestionsGet,
} from "../contact-us-controller";
import {
  ZENDESK_THEMES,
  ZENDESK_FIELD_MAX_LENGTH,
} from "../../../app.constants";
import { ContactUsServiceInterface } from "../types";
import { RequestGet, ResponseRedirect } from "../../../types";

describe("contact us questions controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "http://localhost:3000/enter-email";
  const REFERER_HEADER = "http://localhost/contact-us-further-information";
  const BACKURL = "http://localhost:3000/contact-us";

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
      req.query.theme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = BACKURL;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "something_else",
        subtheme: undefined,
        backurl: BACKURL,
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
        referer: REFERER,
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'GOV.UK email subscriptions' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS;
      req.headers.referer = BACKURL;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "email_subscriptions",
        subtheme: undefined,
        backurl: BACKURL,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.emailSubscriptions.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'A suggestion or feedback' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SUGGESTIONS_FEEDBACK;
      req.headers.referer = BACKURL;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "suggestions_feedback",
        subtheme: undefined,
        backurl: BACKURL,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.suggestionOrFeedback.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });

    it("should render contact-us-questions if a 'A problem proving your identity' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.PROVING_IDENTITY;
      req.headers.referer = BACKURL;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "proving_identity",
        subtheme: undefined,
        backurl: BACKURL,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.provingIdentity.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
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
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "no_security_code",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "invalid_security_code",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'You do not have access to the phone number' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.NO_PHONE_NUMBER_ACCESS;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "no_phone_number_access",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.noPhoneNumberAccess.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'You've forgotten your password' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.FORGOTTEN_PASSWORD;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "forgotten_password",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.forgottenPassword.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'Your account cannot be found' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.ACCOUNT_NOT_FOUND;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "account_not_found",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.accountNotFound.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "technical_error",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "signing_in",
        subtheme: "something_else",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.anotherProblem.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
  });

  describe("contactUsQuestionsGetFromFurtherInformationAccountCreationPage", () => {
    it("should render contact-us-questions if a 'you did not receive a security code' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "no_security_code",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.noSecurityCode.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'the security code did not work' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "invalid_security_code",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.invalidSecurityCode.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'You do not have a UK number' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.NO_UK_MOBILE_NUMBER;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "no_uk_mobile_number",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.noUKMobile.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'technical problem' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "technical_error",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.technicalError.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'something else' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "something_else",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.accountCreation.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });
    it("should render contact-us-questions if a 'problem with authenticator app' radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.subtheme = ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM;
      req.headers.referer = REFERER_HEADER;
      req.query.referer = REFERER;
      contactUsQuestionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("contact-us/questions/index.njk", {
        theme: "account_creation",
        subtheme: "authenticator_app_problem",
        backurl: REFERER_HEADER,
        referer: REFERER,
        pageTitleHeading: "pages.contactUsQuestions.authenticatorApp.title",
        zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
        ipnSupport: undefined,
        appErrorCode: "",
        appSessionId: "",
      });
    });

    describe("contactUsFormPost", () => {
      it("should redirect /contact-us-submit-success page when ticket posted", async () => {
        const fakeService: ContactUsServiceInterface = {
          contactUsSubmitForm: sandbox.fake(),
        };

        await contactUsQuestionsFormPostToZendesk(fakeService)(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.calledWith("/contact-us-submit-success");
      });
    });
  });
});
