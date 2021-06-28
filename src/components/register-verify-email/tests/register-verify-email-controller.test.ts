import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { registerVerifyEmailGet } from "../register-verify-email-controller";
import { UserSession } from "../../../types";

describe("enter-email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("enterEmailGet", () => {
    it("should render the check your email view", () => {
      registerVerifyEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("register-verify-email/index.njk");
    });
  });
});
