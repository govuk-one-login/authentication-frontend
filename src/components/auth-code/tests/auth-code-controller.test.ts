import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { authCodeGet } from "../auth-code-controller";

describe("auth code controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const config = require("../../../config.ts");

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(config, "getApiBaseUrl").returns("http://test-url");

    req = {
      body: {},
      session: {},
      i18n: { language: "en" },
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      status: sandbox.fake(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("authCodeGet", () => {
    it("should redirect to auth code API endpoint with cookie consent param set as not-engaged", () => {
      req.cookies = {};

      authCodeGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        "http://test-url/auth-code?cookie_consent=not-engaged"
      );
    });

    it("should redirect to auth code API endpoint with cookie consent param set as accept", () => {
      req.cookies = { cookies_preferences_set: '{"analytics":true}' };

      authCodeGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        "http://test-url/auth-code?cookie_consent=accept"
      );
    });

    it("should redirect to auth code API endpoint with cookie consent param set as reject", () => {
      req.cookies = { cookies_preferences_set: '{"analytics":false}' };

      authCodeGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        "http://test-url/auth-code?cookie_consent=reject"
      );
    });

    it("should redirect to auth code API endpoint with cookie consent param set as reject and no _ga param", () => {
      req.cookies = {
        cookies_preferences_set: '{"analytics":false}',
      };

      req.session.crossDomainGaTrackingId =
        "2.172053219.3232.1636392870-444224.1635165988";

      authCodeGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        "http://test-url/auth-code?cookie_consent=reject"
      );
    });

    it("should redirect to auth code API endpoint with cookie consent param set as accept and with the _ga param set", () => {
      req.cookies = {
        cookies_preferences_set: '{"analytics":true}',
      };

      req.session.crossDomainGaTrackingId =
        "2.172053219.3232.1636392870-444224.1635165988";

      authCodeGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        "http://test-url/auth-code?cookie_consent=accept&_ga=2.172053219.3232.1636392870-444224.1635165988"
      );
    });
  });
});
