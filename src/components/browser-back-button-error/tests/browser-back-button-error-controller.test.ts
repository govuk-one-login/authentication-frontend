import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { browserBackButtonErrorGet } from "../browser-back-button-error-controller";

describe("browser back button error controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("browserBackButtonErrorGet", () => {
    it("should render browser back button error view", () => {
      browserBackButtonErrorGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "browser-back-button-error/index.njk"
      );
    });
  });
});
