import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { healthcheckGet } from "../healthcheck-controller.js";
import { HTTP_STATUS_CODES } from "../../../app.constants.js";
describe("healthcheck controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { body: {} };
    res = { status: sandbox.stub().returnsThis(), send: sandbox.fake() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("healthcheckGet", () => {
    it("should return 200", () => {
      healthcheckGet(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(HTTP_STATUS_CODES.OK);
    });
  });
});
