import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { signedOutGet } from "../signed-out-controller";

describe("signed out controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      query: {},
      session: {},
      cookies: {
        aps: "123",
        cookies_preferences_set: "abc",
        lng: "en",
        gs: "xyz",
      },
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      clearCookie: sandbox.fake(),
    };
  });

  afterEach(() => {
    sandbox.restore();
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
        "Bad Request:invalid_request:something bad happened"
      );
    });
  });
});
