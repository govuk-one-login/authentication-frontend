import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { enterMfaGet, enterMfaPost } from "../enter-mfa-controller";
import { UserSession } from "../../../types";
import { VerifyCodeInterface } from "../../common/verify-code/types";

describe("enter mfa controller", () => {
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

  describe("enterMfaGet", () => {
    it("should render enter mfa code view", () => {
      enterMfaGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-mfa/index.njk");
    });
  });

  describe("enterMfaPost", () => {
    it("should redirect to /auth-code when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns("MFA_CODE_VERIFIED"),
      };

      req.body.code = "123456";
      req.session.user.id = "123456-djjad";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/auth-code");
    });

    it("should return error when invalid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake(),
      };

      req.t = sandbox.fake.returns("translated string");
      req.body.code = "678988";
      req.session.user.id = "123456-djjad";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("enter-mfa/index.njk");
    });

    it("should redirect to security code expired when invalid code entered more than max retries", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns(
          "PHONE_NUMBER_CODE_MAX_RETRIES_REACHED"
        ),
      };

      req.t = sandbox.fake.returns("translated string");
      req.body.code = "678988";
      req.session.user.id = "123456-djjad";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith("/security-code-expired");
    });
  });
});
