import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import {
  securityCodeCannotRequestCodeGet,
  securityCodeInvalidGet,
  securityCodeTriesExceededGet,
} from "../security-code-error-controller";

describe("security code  controller", () => {
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
      securityCodeInvalidGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-error/index.njk");
    });
  });

  describe("securityCodeTriesExceededGet", () => {
    it("should render security code requested too many times view", () => {
      securityCodeTriesExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk"
      );
    });
  });

  describe("securityCodeCannotRequestGet", () => {
    it("should render security code invalid request view", () => {
      securityCodeCannotRequestCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });
});
