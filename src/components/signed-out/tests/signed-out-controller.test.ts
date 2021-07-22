import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import { signedOutGet } from "../signed-out-controller";

describe("signed out controller", () => {
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

  describe("signedOutGet", () => {
    it("should render the signed out page", () => {
      signedOutGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("signed-out/index.njk");
    });
  });
});
