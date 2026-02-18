import { expect } from "chai";
import { describe } from "mocha";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import {
  mockResponse,
  type RequestOutput,
  type ResponseOutput,
} from "mock-req-res";
import { cannotUseSecurityCodeGet } from "../cannot-use-security-code-controller.js";
import type { Request, Response } from "express";
import { fakeAccountRecoveryService } from "../../common/account-recovery/tests/account-recovery-helper.test.js";

describe("cannot use security code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CANNOT_USE_SECURITY_CODE);
    res = mockResponse();
  });

  describe("cannotUseSecurityCodeGet", () => {
    it("should render the cannot use security code view when account recovery is permitted", async () => {
      await cannotUseSecurityCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(req.session.user.needsForcedMFAReset).to.equal(true);
      expect(req.session.user.isAccountRecoveryPermitted).to.equal(true);
      expect(req.session.user.isAccountRecoveryJourney).to.equal(true);
      expect(res.render).to.have.been.calledWith(
        "cannot-use-security-code/index.njk",
        { changeSecurityCodesLink: PATH_NAMES.MFA_RESET_WITH_IPV }
      );
    });

    it("should render 500 error page when account recovery is not permitted", async () => {
      await cannotUseSecurityCodeGet(fakeAccountRecoveryService(false))(
        req as Request,
        res as Response
      );

      expect(req.session.user.needsForcedMFAReset).to.equal(true);
      expect(req.session.user.isAccountRecoveryPermitted).to.equal(false);
      expect(req.session.user.isAccountRecoveryJourney).to.equal(true);
      expect(res.render).to.have.been.calledWith(
        "common/errors/generic-error.njk"
      );
    });
  });
});
