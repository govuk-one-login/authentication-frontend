import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  furtherInformationGet,
  furtherInformationPost,
} from "../contact-us-controller";
import { ZENDESK_THEMES } from "../../../app.constants";

describe("contact us further information controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "https://gov.uk/sign-in";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, query: {}, get: sandbox.fake() };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("furtherInformationGet", () => {
    it("should render signing in further information if a problem signing in to your account radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.SIGNING_IN;
      req.query.referer = REFERER;
      furtherInformationGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/further-information/index.njk",
        {
          theme: "signing_in",
          referer: REFERER,
        }
      );
    });

    it("should render account creation further information if a creating an account radio option was chosen", () => {
      req.query.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.query.referer = REFERER;
      furtherInformationGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/further-information/index.njk",
        {
          theme: "account_creation",
          referer: REFERER,
        }
      );
    });

    it("should redirect to contact-us when no theme is present in request", () => {
      furtherInformationGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/contact-us");
    });
  });

  describe("signingInFurtherInformationPost", () => {
    it("should redirect /contact-us-questions page when 'You did not receive a security code' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=no_security_code&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'The security code did not work' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=invalid_security_code&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'You do not have access to the phone number' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.NO_PHONE_NUMBER_ACCESS;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=no_phone_number_access&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'You’ve forgotten your password' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.FORGOTTEN_PASSWORD;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=forgotten_password&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'Your account cannot be found' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.ACCOUNT_NOT_FOUND;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=account_not_found&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'There was a technical problem' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=technical_error&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'Something else' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=something_else&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
  });

  describe("accountCreationFurtherInformationPost", () => {
    it("should redirect /contact-us-questions page when 'You did not receive a security code' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = ZENDESK_THEMES.NO_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=no_security_code&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'The security code did not work' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = ZENDESK_THEMES.INVALID_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=invalid_security_code&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'You do not have a UK mobile phone number' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = ZENDESK_THEMES.NO_UK_MOBILE_NUMBER;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=no_uk_mobile_number&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'There was a technical problem' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = ZENDESK_THEMES.TECHNICAL_ERROR;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=technical_error&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'Something else' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=something_else&referer=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
  });
});
