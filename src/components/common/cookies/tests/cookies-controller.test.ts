import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { cookiesGet, cookiesPost } from "../cookies-controller";
import { COOKIES_PREFERENCES_SET, PATH_NAMES } from "../../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";

describe("cookies controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.COOKIES_POLICY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("cookiesGet", () => {
    it("should render cookies page", () => {
      req.headers.referer = "/last-page";

      cookiesGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("common/cookies/index.njk");
      expect(res.locals.updated).to.equal(false);
      expect(res.locals.backUrl).to.equal("/last-page");
    });
  });
  describe("cookiesPost", () => {
    it("should save analytics preferences as yes and render cookies page", () => {
      req.body.cookie_preferences = "true";
      req.body.originalReferer = "/page-before-1";

      cookiesPost(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("common/cookies/index.njk");
      expect(res.locals.analyticsConsent).to.equal(true);
      expect(res.locals.updated).to.equal(true);
      expect(res.locals.backUrl).to.equal("/page-before-1");
      expect(res.cookie).to.have.been.calledWith(COOKIES_PREFERENCES_SET);
    });
    it("should save analytics preferences as no and render cookies page", () => {
      req.body.cookie_preferences = "false";
      req.body.originalReferer = "/page-before-2";

      cookiesPost(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("common/cookies/index.njk");
      expect(res.locals.analyticsConsent).to.equal(false);
      expect(res.locals.updated).to.equal(true);
      expect(res.locals.backUrl).to.equal("/page-before-2");
      expect(res.cookie).to.have.been.calledWith(COOKIES_PREFERENCES_SET);
    });
  });
});
