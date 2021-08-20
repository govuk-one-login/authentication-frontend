import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import { accountNotFoundGet, accountNotFoundPost } from "../account-not-found-controller";
import { SERVICE_TYPE } from "../../../app.constants";
import { AccountNotFoundServiceInterface } from "../types";

describe("sign in or create controller", () => {
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

  describe("accountNotFoundGet", () => {

    it("should render the account not found mandatory view when serviceType undefined", () => {
      accountNotFoundGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("account-not-found/account-not-found-mandatory.njk");
    });

    it("should render the account not found optional view when serviceType optional", () => {
      req.session.serviceType = SERVICE_TYPE.OPTIONAL;
      accountNotFoundGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("account-not-found/account-not-found-optional.njk");
    });

    it("should redirect to /check-your-email when no account exists", async () => {
      const fakeService: AccountNotFoundServiceInterface = {
        sendEmailVerificationNotification: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "sadl990asdald";

      await accountNotFoundPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/check-your-email");
      expect(fakeService.sendEmailVerificationNotification).to.have.been.calledOnce;
    });

  });

  
});
