import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { contactUsFormPost, contactUsGet } from "../contact-us-controller";
import { SUPPORT_TYPE, ZENDESK_THEMES } from "../../../app.constants";

describe("contact us controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const FROM_PAGE = "https://gov.uk/sign-in";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, query: {}, headers: {}, get: sandbox.fake() };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("contactUsGet", () => {
    it("should render contact us gov page if gov radio option was chosen", () => {
      req.query.supportType = SUPPORT_TYPE.GOV_SERVICE;
      contactUsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-gov-service-contact-us.njk"
      );
    });

    it("should render contact us public page if public radio option was chosen", () => {
      req.query.supportType = SUPPORT_TYPE.PUBLIC;
      contactUsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-public-contact-us.njk"
      );
    });
  });

  describe("contactUsFormPost", () => {
    it("should redirect /contact-us-further-information page when 'A problem signing in to your account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.fromPage = FROM_PAGE;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-further-information?theme=signing_in&fromPage=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-further-information page when 'A problem creating an account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.fromPage = FROM_PAGE;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-further-information?theme=account_creation&fromPage=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'Another problem using your GOV.UK account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.body.fromPage = FROM_PAGE;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=something_else&fromPage=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'GOV.UK email subscriptions' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS;
      req.body.fromPage = FROM_PAGE;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=email_subscriptions&fromPage=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
    it("should redirect /contact-us-questions page when 'A suggestion or feedback about using your GOV.UK account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SUGGESTIONS_FEEDBACK;
      req.body.fromPage = FROM_PAGE;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=suggestions_feedback&fromPage=https%3A%2F%2Fgov.uk%2Fsign-in"
      );
    });
  });
});
