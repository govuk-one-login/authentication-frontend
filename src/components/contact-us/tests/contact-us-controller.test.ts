import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  contactUsFormPost,
  contactUsGet,
  validateAppErrorCode,
  getAppErrorCode,
  getAppSessionId,
  validateAppId,
  createTicketIdentifier,
  isAppJourney,
} from "../contact-us-controller";
import { SUPPORT_TYPE, ZENDESK_THEMES } from "../../../app.constants";
import { RequestGet, ResponseRedirect } from "../../../types";

describe("contact us controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "http://localhost:3000/enter-email";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      query: {},
      headers: {},
      get: sandbox.fake() as unknown as RequestGet,
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
    it("should redirect /contact-us-further-information page when 'A problem signing in to your GOV.UK account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SIGNING_IN;
      req.body.referer = REFERER;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-further-information?theme=signing_in&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-further-information page when 'A problem creating a GOV.UK account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.ACCOUNT_CREATION;
      req.body.referer = REFERER;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-further-information?theme=account_creation&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'Another problem using your GOV.UK account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SOMETHING_ELSE;
      req.body.referer = REFERER;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=something_else&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'GOV.UK email subscriptions' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS;
      req.body.referer = REFERER;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=email_subscriptions&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'A suggestion or feedback about using your GOV.UK account' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.SUGGESTIONS_FEEDBACK;
      req.body.referer = REFERER;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=suggestions_feedback&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'A problem proving your identity' radio option is chosen", async () => {
      req.body.theme = ZENDESK_THEMES.PROVING_IDENTITY;
      req.body.referer = REFERER;

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=proving_identity&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
  });
});

describe("appErrorCode and appSessionId query parameters", () => {
  const validAppErrorCodes = ["abcd", "1234", "ab12", "12ab"];
  const invalidAppErrorCodes = ["abcde", "12345", "zb12", "12ag"];
  const validAppSessionIds = [
    "1234abcd-12ab-11aa-90aa-04938abc12ab",
    "abc5678a-ab12-1c56-88ed-facc89109aee",
  ];
  const invalidAppSessionIds = [
    "1234zbcd-12zb-11zz-90zz-04938zc12zb",
    "zbc5678z-zb12-1c56-88ed-fzcc89109ee",
  ];

  describe("validateAppErrorCode", () => {
    validAppErrorCodes.forEach((i) => {
      it(`should return true when passed a valid string like ${i}`, () => {
        expect(validateAppErrorCode(i)).to.be.true;
      });
    });

    invalidAppErrorCodes.forEach((i) => {
      it(`should return false when passed an invalid string like ${i}`, () => {
        expect(validateAppErrorCode(i)).to.be.false;
      });
    });
  });

  describe("getAppErrorCode", () => {
    it(`It should return "" if passed an empty string`, () => {
      expect(getAppErrorCode("")).to.equal("");
    });

    validAppErrorCodes.forEach((i) => {
      it(`should return the original string when passed a valid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.equal(i);
      });
    });

    invalidAppErrorCodes.forEach((i) => {
      it(`should return "" when passed an invalid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.be.equal("");
      });
    });
  });

  describe("validateAppSessionId", () => {
    validAppSessionIds.forEach((i) => {
      it(`should return true when passed a valid string like ${i}`, () => {
        expect(validateAppId(i)).to.be.true;
      });
    });
  });

  describe("getAppSessionId", () => {
    it(`It should return "" if passed an empty string`, () => {
      expect(getAppSessionId("")).to.be.equal("");
    });

    validAppSessionIds.forEach((i) => {
      it(`should return the original string when passed a valid string like ${i}`, () => {
        expect(getAppSessionId(i)).to.equal(i);
      });
    });

    invalidAppSessionIds.forEach((i) => {
      it(`should return "" when passed an invalid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.equal("");
      });
    });
  });

  describe("createTicketIdentifier", () => {
    validAppSessionIds.forEach((i) => {
      it(`should return the original string when passed a valid appSessionId like ${i}`, () => {
        expect(createTicketIdentifier(i)).to.equal(i);
      });
    });

    invalidAppSessionIds.forEach((i) => {
      it(`should return not return the original string when passed an invalid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.not.equal(i);
      });
    });
  });

  describe("isAppJourney", () => {
    validAppSessionIds.forEach((i) => {
      it(`should return true when passed a valid appSessionId like ${i}`, () => {
        expect(isAppJourney(i)).to.be.true;
      });
    });

    invalidAppSessionIds.forEach((i) => {
      it(`should return false when passed a invalid appSessionId like ${i}`, () => {
        expect(isAppJourney(i)).to.be.false;
      });
    });
  });
});
