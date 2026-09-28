import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import type { Request, Response } from "express";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { renderLockoutPageIfLocked } from "../security-code-error-helper.js";

const NEW_CODE_LINK = PATH_NAMES.RESEND_MFA_CODE;

function futureDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toUTCString();
}

describe("security-code-error-helper", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.RESEND_MFA_CODE);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("renderLockoutPageIfLocked", () => {
    it("should not render anything and return false when the user is not locked", () => {
      const result = renderLockoutPageIfLocked(
        req as Request,
        res as Response,
        NEW_CODE_LINK
      );

      expect(result).to.be.false;
      expect(res.render).to.not.have.been.called;
    });

    it("should render the wait page and return true when the code request lock is active", () => {
      req.session.user.codeRequestLock = futureDate();

      const result = renderLockoutPageIfLocked(
        req as Request,
        res as Response,
        NEW_CODE_LINK
      );

      expect(result).to.be.true;
      expect(res.render).to.have.been.calledWith(
        "security-code-error/index-wait.njk"
      );
      expect(res.render.callCount).to.equal(1);
    });

    it("should render the code-entered-exceeded page with the given newCodeLink and return true when the wrong code lock is active", () => {
      req.session.user.wrongCodeEnteredLock = futureDate();

      const result = renderLockoutPageIfLocked(
        req as Request,
        res as Response,
        NEW_CODE_LINK
      );

      expect(result).to.be.true;
      expect(res.render).to.have.been.calledWithMatch(
        "security-code-error/index-security-code-entered-exceeded.njk",
        sinon.match({
          newCodeLink: NEW_CODE_LINK,
          isAuthApp: false,
        })
      );
      expect(res.render.callCount).to.equal(1);
    });

    it("should prioritise the wrong-code lockout page over the wait page when both locks are active", () => {
      req.session.user.wrongCodeEnteredLock = futureDate();
      req.session.user.codeRequestLock = futureDate();

      const result = renderLockoutPageIfLocked(
        req as Request,
        res as Response,
        NEW_CODE_LINK
      );

      expect(result).to.be.true;
      expect(res.render).to.have.been.calledWithMatch(
        "security-code-error/index-security-code-entered-exceeded.njk"
      );
      expect(res.render.callCount).to.equal(1);
    });

    [
      {
        isSignInJourney: true,
        isAccountRecoveryJourney: false,
        expectedShow2HrScreen: true,
      },
      {
        isSignInJourney: false,
        isAccountRecoveryJourney: true,
        expectedShow2HrScreen: false,
      },
      {
        isSignInJourney: true,
        isAccountRecoveryJourney: true,
        expectedShow2HrScreen: false,
      },
      {
        isSignInJourney: false,
        isAccountRecoveryJourney: false,
        expectedShow2HrScreen: false,
      },
    ].forEach((scenario) => {
      it(`should set show2HrScreen to ${scenario.expectedShow2HrScreen} when isSignInJourney is ${scenario.isSignInJourney} and isAccountRecoveryJourney is ${scenario.isAccountRecoveryJourney}`, () => {
        req.session.user.wrongCodeEnteredLock = futureDate();
        req.session.user.isSignInJourney = scenario.isSignInJourney;
        req.session.user.isAccountRecoveryJourney =
          scenario.isAccountRecoveryJourney;

        renderLockoutPageIfLocked(
          req as Request,
          res as Response,
          NEW_CODE_LINK
        );

        expect(res.render).to.have.been.calledWithMatch(
          "security-code-error/index-security-code-entered-exceeded.njk",
          sinon.match({
            show2HrScreen: scenario.expectedShow2HrScreen,
          })
        );
      });
    });
  });
});
