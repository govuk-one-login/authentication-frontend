import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils.js";
import { expect } from "chai";
import { accountInterventionsMiddleware } from "../../../src/middleware/account-interventions-middleware.js";
import { AccountInterventionsInterface } from "../../../src/components/account-intervention/types.js";
import { accountInterventionsFakeHelper } from "../../helpers/account-interventions-helpers.js";
describe("accountInterventionsMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest({
      session: {
        user: {
          email: "test@test.com",
        },
        save: (callback: () => void) => callback(),
      },
      log: { error: sinon.fake(), info: sinon.fake(), debug: sinon.fake() },
      path: PATH_NAMES.AUTH_CODE,
    });
    res = mockResponse({
      locals: {
        sessionId: "test-session",
        clientSessionId: "test-client-session",
        persistentSessionId: "test-persistent-session",
      },
    });
    next = sinon.fake() as unknown as NextFunction;
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
  });

  describe("when supportAccountInterventions() returns false", function () {
    beforeEach(() => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "0";
    });

    it("should call next()", async () => {
      const fakeAccountInterventionService = accountInterventionsFakeHelper({
        passwordResetRequired: false,
        blocked: false,
        temporarilySuspended: false,
        reproveIdentity: false,
      });

      await callMiddleware(false, false, fakeAccountInterventionService);
      expect(next).to.be.calledOnce;
    });
  });

  describe("when supportAccountInterventions() returns true", function () {
    beforeEach(() => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
    });

    describe("when there are no account interventions", function () {
      let noAccountInterventionsService: AccountInterventionsInterface;

      before(() => {
        noAccountInterventionsService = accountInterventionsFakeHelper({
          passwordResetRequired: false,
          blocked: false,
          temporarilySuspended: false,
          reproveIdentity: false,
        });

        it("should call next() when no account intervention API response options are true", async () => {
          await callMiddleware(false, false, noAccountInterventionsService);
          expect(next).to.be.calledOnce;
        });
      });
    });

    describe("when blocked is true", function () {
      let accountInterventionsWithBlockedTrue: AccountInterventionsInterface;

      before(() => {
        accountInterventionsWithBlockedTrue = accountInterventionsFakeHelper({
          passwordResetRequired: true,
          blocked: true,
          temporarilySuspended: true,
          reproveIdentity: false,
        });
      });

      it("should redirect to UNAVAILABLE PERMANENT", async () => {
        await callMiddleware(false, false, accountInterventionsWithBlockedTrue);
        expect(res.redirect).to.have.been.calledWith(
          PATH_NAMES.UNAVAILABLE_PERMANENT
        );
      });
    });

    describe("when passwordResetRequired and temporarilySuspended is true", function () {
      let accountInterventionsWithPasswordResetTrue: AccountInterventionsInterface;

      before(() => {
        accountInterventionsWithPasswordResetTrue =
          accountInterventionsFakeHelper({
            passwordResetRequired: true,
            blocked: false,
            temporarilySuspended: true,
            reproveIdentity: false,
          });
      });

      it("should redirect to PASSWORD_RESET_REQUIRED when handlePasswordResetStatus is true", async () => {
        await callMiddleware(
          false,
          true,
          accountInterventionsWithPasswordResetTrue
        );
        expect(res.redirect).to.have.been.calledWith(
          PATH_NAMES.PASSWORD_RESET_REQUIRED
        );
      });

      it("should call next when handlePasswordResetStatus is false", async () => {
        await callMiddleware(
          false,
          false,
          accountInterventionsWithPasswordResetTrue
        );
        expect(res.redirect).to.not.have.been.calledWith(
          PATH_NAMES.PASSWORD_RESET_REQUIRED
        );
        expect(next).to.be.calledOnce;
      });

      it("should redirect to PASSWORD_RESET_REQUIRED when handlePasswordResetStatus AND handleSuspendedStatus are both true", async () => {
        await callMiddleware(
          true,
          true,
          accountInterventionsWithPasswordResetTrue
        );
        expect(res.redirect).to.have.been.calledWith(
          PATH_NAMES.PASSWORD_RESET_REQUIRED
        );
      });

      it("should redirect to PASSWORD_RESET_REQUIRED when handlePasswordResetStatus is true and the passwordResetTime is before the intervention appliedAt time", async () => {
        const nowUnixTime = Date.now().valueOf();
        const beforeNow = nowUnixTime - 1000;

        req.session.user.passwordResetTime = beforeNow;

        const accountInterventionsWithPasswordResetTrueAndAppliedAtNow =
          accountInterventionsFakeHelper(
            {
              passwordResetRequired: true,
              blocked: false,
              temporarilySuspended: true,
              reproveIdentity: false,
            },
            nowUnixTime
          );

        await callMiddleware(
          true,
          true,
          accountInterventionsWithPasswordResetTrueAndAppliedAtNow
        );
        expect(res.redirect).to.have.been.calledWith(
          PATH_NAMES.PASSWORD_RESET_REQUIRED
        );
      });

      it("should not redirect to PASSWORD_RESET_REQUIRED when handlePasswordResetStatus is true and the passwordResetTime is after the intervention appliedAt time", async () => {
        const nowUnixTime = Date.now().valueOf();
        const beforeNow = nowUnixTime - 1000;

        req.session.user.passwordResetTime = nowUnixTime;

        const accountInterventionsWithPasswordResetTrueAndAppliedAtNow =
          accountInterventionsFakeHelper(
            {
              passwordResetRequired: true,
              blocked: false,
              temporarilySuspended: true,
              reproveIdentity: false,
            },
            beforeNow
          );

        await callMiddleware(
          true,
          true,
          accountInterventionsWithPasswordResetTrueAndAppliedAtNow
        );
        expect(res.redirect).not.to.have.been.calledWith(
          PATH_NAMES.PASSWORD_RESET_REQUIRED
        );
        expect(next).to.have.been.calledOnce;
      });

      it("should not redirect to UNAVAILABLE_TEMPORARY when handleSuspended status is true and handlePasswordResetStatus is false", async () => {
        await callMiddleware(
          true,
          false,
          accountInterventionsWithPasswordResetTrue
        );
        expect(res.redirect).to.not.have.been.calledWith(
          PATH_NAMES.UNAVAILABLE_TEMPORARY
        );
        expect(next).to.be.calledOnce;
      });
    });

    describe("when reproveIdentity and temporarilySuspended is true", () => {
      let accountIntervetionsWithReproveIdentity: AccountInterventionsInterface;

      before(() => {
        accountIntervetionsWithReproveIdentity = accountInterventionsFakeHelper(
          {
            passwordResetRequired: false,
            blocked: false,
            temporarilySuspended: true,
            reproveIdentity: true,
          }
        );
      });

      it("should not redirect to UNAVAILABLE_TEMPORARY when handleSuspended status is true and handlePasswordResetStatus is false", async () => {
        await callMiddleware(
          true,
          false,
          accountIntervetionsWithReproveIdentity
        );
        expect(res.redirect).to.not.have.been.calledWith(
          PATH_NAMES.UNAVAILABLE_TEMPORARY
        );
        expect(next).to.be.calledOnce;
      });
    });

    describe("when temporarilySuspended is true", function () {
      let accountInterventionsWithTemporarilySuspendedTrue: AccountInterventionsInterface;

      before(() => {
        accountInterventionsWithTemporarilySuspendedTrue =
          accountInterventionsFakeHelper({
            passwordResetRequired: false,
            blocked: false,
            temporarilySuspended: true,
            reproveIdentity: false,
          });
      });

      it("should redirect to UNAVAILABLE_TEMPORARY when handleSuspendedStatus is true", async () => {
        await callMiddleware(
          true,
          false,
          accountInterventionsWithTemporarilySuspendedTrue
        );
        expect(res.redirect).to.have.been.calledWith(
          PATH_NAMES.UNAVAILABLE_TEMPORARY
        );
      });

      it("should not redirect to UNAVAILABLE_TEMPORARY when handleSuspendedStatus is false", async () => {
        await callMiddleware(
          false,
          false,
          accountInterventionsWithTemporarilySuspendedTrue
        );

        expect(res.redirect).to.not.have.been.calledWith(
          PATH_NAMES.UNAVAILABLE_TEMPORARY
        );

        expect(next).to.have.been.calledOnce;
      });
    });
  });

  const callMiddleware = async (
    handleSuspendedStatus: boolean,
    handlePasswordResetStatus: boolean,
    accountInterventionService: AccountInterventionsInterface
  ) => {
    await accountInterventionsMiddleware(
      handleSuspendedStatus,
      handlePasswordResetStatus,
      undefined,
      accountInterventionService
    )(req as Request, res as Response, next as NextFunction);
  };
});
