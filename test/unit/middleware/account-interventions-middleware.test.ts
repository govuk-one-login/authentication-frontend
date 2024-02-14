import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../src/app.constants";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { expect } from "chai";
import { accountInterventionsMiddleware } from "../../../src/middleware/account-interventions-middleware";
import { AccountInterventionsInterface } from "../../../src/components/account-intervention/types";
import { AccountInterventionsFlags } from "../../helpers/account-interventions-helpers";

describe("accountInterventionsMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
    req = mockRequest({
      session: {
        user: {
          email: "test@test.com",
        },
      },
      log: { error: sinon.fake(), info: sinon.fake() },
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

  it("should call next() when no account intervention API response options are true and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService = fakeAccountInterventionsService({
      passwordResetRequired: false,
      blocked: false,
      temporarilySuspended: false,
    });

    await callMiddleware(fakeAccountInterventionService);
    expect(next).to.be.calledOnce;
  });

  it("should call next() when supportAccountInterventions() returns false", async () => {
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "0";
    const fakeAccountInterventionService = fakeAccountInterventionsService({
      passwordResetRequired: false,
      blocked: false,
      temporarilySuspended: false,
    });

    await callMiddleware(fakeAccountInterventionService);
    expect(next).to.be.calledOnce;
  });

  it("should redirect to getNextPathAndUpdateJourney with the journey being PASSWORD_RESET_INTERVENTION when passwordResetRequired === true in the response and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService = fakeAccountInterventionsService({
      passwordResetRequired: true,
      blocked: false,
      temporarilySuspended: false,
    });

    await callMiddleware(fakeAccountInterventionService);
    expect(res.redirect).to.have.been.calledWith(
      PATH_NAMES.PASSWORD_RESET_REQUIRED
    );
  });

  it("should redirect to getNextPathAndUpdateJourney with the journey being PERMANENTLY_BLOCKED_INTERVENTION when blocked === true in the response and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService = fakeAccountInterventionsService({
      passwordResetRequired: false,
      blocked: true,
      temporarilySuspended: false,
    });

    await callMiddleware(fakeAccountInterventionService);
    expect(res.redirect).to.have.been.calledWith(
      PATH_NAMES.UNAVAILABLE_PERMANENT
    );
  });

  it("should redirect to getNextPathAndUpdateJourney with the journey being TEMPORARILY_BLOCKED_INTERVENTION when temporarilySuspended === true in the response and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService = fakeAccountInterventionsService({
      passwordResetRequired: false,
      blocked: false,
      temporarilySuspended: true,
    });
    await callMiddleware(fakeAccountInterventionService);

    expect(res.redirect).to.not.have.been.calledWith(
      PATH_NAMES.UNAVAILABLE_TEMPORARY
    );
  });

  const callMiddleware = (
    accountInterventionService: AccountInterventionsInterface
  ) => {
    accountInterventionsMiddleware(accountInterventionService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
  };

  const fakeAccountInterventionsService = (
    flags: AccountInterventionsFlags
  ) => {
    return {
      accountInterventionStatus: sinon.fake.returns({
        data: {
          email: "test@test.com",
          passwordResetRequired: flags.passwordResetRequired,
          blocked: flags.blocked,
          temporarilySuspended: flags.temporarilySuspended,
        },
      }),
    } as unknown as AccountInterventionsInterface;
  };
});
