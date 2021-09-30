import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import { accountCreatedGet } from "../account-created-controller";

describe("account created controller", () => {
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

  describe("registerAccountCreatedGet", () => {
    it("should render account created page", () => {
      req.session.serviceType = "MANDATORY";
      req.session.clientName = "test client name";

      accountCreatedGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("account-created/index.njk");
    });
  });
});
