import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { VerifyCodeInterface } from "../../common/verify-code/types";
import {
  checkYourEmailGet,
  checkYourEmailPost,
} from "../check-your-email-controller";

describe("check your email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      session: {},
      i18n: { language: "" },
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      status: sandbox.fake(),
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("checkYourEmailGet", () => {
    it("should render the check your email view", () => {
      checkYourEmailGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("check-your-email/index.njk");
    });
  });

  describe("checkYourEmailPost", () => {
    it("should redirect to /create-password when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          sessionState: "EMAIL_CODE_VERIFIED",
          success: true,
        }),
      };

      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await checkYourEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/create-password");
    });

    it("should return error when invalid code", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          success: false,
          sessionState: "EMAIL_CODE_NOT_VALID",
        }),
      };
      req.t = sandbox.fake.returns("translated string");
      req.body.code = "678988";
      req.session.id = "123456-djjad";

      await checkYourEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("check-your-email/index.njk");
    });

    it("should update the user session state value in the req", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          success: true,
          sessionState: "EMAIL_CODE_VERIFIED",
        }),
      };

      expect(req.session.nextState).to.be.undefined;

      await checkYourEmailPost(fakeService)(req as Request, res as Response);

      expect(req.session.nextState).to.equal("EMAIL_CODE_VERIFIED");
    });
  });
});
