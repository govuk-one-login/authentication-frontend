import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { verifyEmailGet, verifyEmailPost } from "../verify-email-controller";
import { UserSession } from "../../../types";
import { VerifyCodeInterface } from "../../common/verify-code/types";

describe("verify email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      session: { user: {} as UserSession },
      i18n: { language: "" },
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

  describe("verifyEmailGet", () => {
    it("should render the check your email view", () => {
      verifyEmailGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("verify-email/index.njk");
    });
  });

  describe("verifyEmailPost", () => {
    it("should redirect to /create-password when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns("EMAIL_CODE_VERIFIED"),
      };

      req.body.code = "123456";
      req.session.user.id = "123456-djjad";

      await verifyEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/create-password");
    });

    it("should return error when invalid code", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns(false),
      };
      req.t = sandbox.fake.returns("translated string");
      req.body.code = "678988";
      req.session.user.id = "123456-djjad";

      await verifyEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("verify-email/index.njk");
    });
  });
});
