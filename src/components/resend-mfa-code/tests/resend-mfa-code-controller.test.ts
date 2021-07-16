import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "../resend-mfa-code-controller";
import { MfaServiceInterface } from "../../common/mfa/types";

describe("resend mfa controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      session: { user: {} as UserSession },
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

  describe("resendMfaCodeGet", () => {
    it("should render resend mfa code view", () => {
      resendMfaCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("resend-mfa-code/index.njk");
    });
  });

  describe("resendMfaCodePost", () => {
    it("should send mfa code and redirect to /enter-code view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sandbox.fake(),
      };

      req.session.user = {
        id: "123456-djjad",
        email: "test@test.com",
      };

      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith("/enter-code");
      expect(fakeService.sendMfaCode).to.have.been.calledOnce;
    });
  });
});
