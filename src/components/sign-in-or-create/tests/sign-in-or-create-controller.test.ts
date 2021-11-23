import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { signInOrCreateGet } from "../sign-in-or-create-controller";
import { ClientInfoServiceInterface } from "../../common/client-info/types";

describe("sign in or create controller", () => {
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

  describe("signInOrCreateGet", () => {
    it("should render the sign in or create view", async () => {
      const fakeService: ClientInfoServiceInterface = {
        clientInfo: sandbox.fake.returns({
          success: true,
          data: { scopes: ["openid", "profile"] },
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await signInOrCreateGet(fakeService)(req as Request, res as Response);

      expect(res.render).to.have.calledWith("sign-in-or-create/index.njk");
    });
  });
});
