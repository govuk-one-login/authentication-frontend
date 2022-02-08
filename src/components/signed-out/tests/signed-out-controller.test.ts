import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { signedOutGet } from "../signed-out-controller";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("signed out controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
      cookies: {
        aps: "123",
        cookies_preferences_set: "abc",
        lng: "en",
        gs: "xyz",
      },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signedOutGet", () => {
    it("should render the signed out page and delete cookies unrelated to user preferences", () => {
      signedOutGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("signed-out/index.njk");
      expect(res.clearCookie).to.have.calledWith("aps");
      expect(res.clearCookie).not.to.have.calledWith("cookies_preferences_set");
      expect(res.clearCookie).not.to.have.calledWith("lng");
      expect(res.clearCookie).to.have.calledWith("gs");
    });

    it("should throw error when invalid sign out request", () => {
      req.query.error_code = "invalid_request";
      req.query.error_description = "something bad happened";

      expect(() => signedOutGet(req as Request, res as Response)).to.throw(
        "invalid_request:something bad happened"
      );
    });
  });
});
