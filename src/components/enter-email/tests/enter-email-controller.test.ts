import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { enterEmailGet, enterEmailPost } from "../enter-email-controller";
import { UserSession } from "../../../types";
import { EnterEmailServiceInterface } from "../types";

describe("enter email controller", () => {
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

  describe("enterEmailGet", () => {
    it("should render enter email view", () => {
      enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-email/index.njk");
    });
  });

  describe("enterEmailPost", () => {
    it("should redirect to enter-password when account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sandbox.fake.returns(true),
        sendEmailVerificationNotification: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "dsad.dds";

      await enterEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.userExists).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/enter-password");
    });

    it("should redirect to /verify-email when no account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sandbox.fake.returns(false),
        sendEmailVerificationNotification: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "sadl990asdald";

      await enterEmailPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/check-your-email");
      expect(fakeService.sendEmailVerificationNotification).to.have.been
        .calledOnce;
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterEmailServiceInterface = {
        userExists: sandbox.fake.throws(error),
        sendEmailVerificationNotification: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "231dccsd";

      await expect(
        enterEmailPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeService.userExists).to.have.been.calledOnce;
      expect(fakeService.sendEmailVerificationNotification).not.to.been.called;
    });

    it("should throw error when session is not populated", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sandbox.fake(),
        sendEmailVerificationNotification: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session = undefined;

      await expect(
        enterEmailPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot read property 'user' of undefined"
      );

      expect(fakeService.userExists).not.to.been.called;
      expect(fakeService.sendEmailVerificationNotification).not.to.been.called;
    });
  });
});
