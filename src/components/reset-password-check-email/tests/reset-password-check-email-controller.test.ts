import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";

import { resetPasswordCheckEmailGet } from "../reset-password-check-email-controller";

describe("reset password check email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("resetPasswordCheckEmailGet", () => {
    it("should render reset password check email view", () => {
      resetPasswordCheckEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "reset-password-check-email/index.njk"
      );
    });
  });
});
