import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { resetPasswordCheckEmailGet } from "../reset-password-check-email-controller";
import { ResetPasswordCheckEmailServiceInterface } from "../types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("reset password check email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPasswordCheckEmailGet", () => {
    it("should render reset password check email view", async () => {
      const fakeService: ResetPasswordCheckEmailServiceInterface = {
        resetPasswordRequest: sinon.fake.returns({
          success: true,
          sessionState: "RESET_PASSWORD_LINK_SENT",
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      req.session.user = {
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
