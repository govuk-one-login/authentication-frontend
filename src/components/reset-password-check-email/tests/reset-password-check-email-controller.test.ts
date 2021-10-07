import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { resetPasswordCheckEmailGet } from "../reset-password-check-email-controller";
import { ResetPasswordCheckEmailServiceInterface } from "../types";

describe("reset password check email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("resetPasswordCheckEmailGet", () => {
    it("should render reset password check email view", async () => {
      const fakeService: ResetPasswordCheckEmailServiceInterface = {
        resetPasswordRequest: sandbox.fake.returns({
          success: true,
          sessionState: "RESET_PASSWORD_LINK_SENT",
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      req.session = {
        id: "12-d0dasdk",
        email: "joe.bloggs@test.com",
      };

      await resetPasswordCheckEmailGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "reset-password-check-email/index.njk"
      );
    });
  });
});
