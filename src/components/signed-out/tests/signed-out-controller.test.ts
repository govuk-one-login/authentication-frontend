import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { signedOutGet } from "../signed-out-controller.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
describe("signed out controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SIGNED_OUT);
    req.session.destroy = sinon.fake();
    req.cookies = { aps: "123", cookies_preferences_set: "abc", lng: "en", gs: "xyz" };
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
      expect(req.session.destroy).to.have.been.calledOnce;
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
