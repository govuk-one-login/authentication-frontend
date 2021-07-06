import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { securityCodeExpiredGet } from "../security-code-expired-controller";
import { UserSession } from "../../../types";

describe("security code expired controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("securityCodeExpiredGet", () => {
    it("should render security code expired view", () => {
      securityCodeExpiredGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-expired/index.njk");
    });
  });
});
