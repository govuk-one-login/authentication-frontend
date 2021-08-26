import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import { signInOrCreateGet } from "../sign-in-or-create-controller";
import { SignInOrCreateServiceInterface } from "../types";

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

  describe("signInOrCreateGet", () => {
    it("should render the sign in or create view", async () => {
      const fakeService: SignInOrCreateServiceInterface = {
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"] }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";

      await signInOrCreateGet(fakeService)(req as Request, res as Response);

      expect(res.render).to.have.calledWith("sign-in-or-create/index.njk");
    });
  });

  
});
