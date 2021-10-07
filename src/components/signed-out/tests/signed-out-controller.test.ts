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
  });
});
