import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../src/app.constants";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { expect } from "chai";
import { accountInterventionsMiddleware } from "../../../src/middleware/account-interventions-middleware";
import { AccountInterventionsInterface } from "../../../src/components/account-intervention/types";

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
    const fakeAccountInterventionService: AccountInterventionsInterface = {
      accountInterventionStatus: sinon.fake.returns({
        data: {
          email: "test@test.com",
          passwordResetRequired: false,
          blocked: false,
          temporarilySuspended: false,
        },
      }),
    } as unknown as AccountInterventionsInterface;
    await accountInterventionsMiddleware(fakeAccountInterventionService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(next).to.be.calledOnce;
  });

  it("should call next() when supportAccountInterventions() returns false", async () => {
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "0";
    const fakeAccountInterventionService: AccountInterventionsInterface = {
      accountInterventionStatus: sinon.fake.returns({
        data: {
          email: "test@test.com",
          passwordResetRequired: false,
          blocked: false,
          temporarilySuspended: false,
        },
      }),
    } as unknown as AccountInterventionsInterface;
    await accountInterventionsMiddleware(fakeAccountInterventionService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(next).to.be.calledOnce;
  });

  it("should redirect to getNextPathAndUpdateJourney with the journey being PASSWORD_RESET_INTERVENTION when passwordResetRequired === true in the response and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService: AccountInterventionsInterface = {
      accountInterventionStatus: sinon.fake.returns({
        data: {
          email: "test@test.com",
          passwordResetRequired: true,
          blocked: false,
          temporarilySuspended: false,
        },
      }),
    } as unknown as AccountInterventionsInterface;
    await accountInterventionsMiddleware(fakeAccountInterventionService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(res.redirect).to.have.been.calledWith(
      PATH_NAMES.PASSWORD_RESET_REQUIRED
    );
  });

  it("should redirect to getNextPathAndUpdateJourney with the journey being PERMANENTLY_BLOCKED_INTERVENTION when blocked === true in the response and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService: AccountInterventionsInterface = {
      accountInterventionStatus: sinon.fake.returns({
        data: {
          email: "test@test.com",
          passwordResetRequired: false,
          blocked: true,
          temporarilySuspended: false,
        },
      }),
    } as unknown as AccountInterventionsInterface;
    await accountInterventionsMiddleware(fakeAccountInterventionService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(res.redirect).to.have.been.calledWith(
      PATH_NAMES.UNAVAILABLE_PERMANENT
    );
  });

  it("should redirect to getNextPathAndUpdateJourney with the journey being TEMPORARILY_BLOCKED_INTERVENTION when temporarilySuspended === true in the response and supportAccountInterventions() returns true", async () => {
    const fakeAccountInterventionService: AccountInterventionsInterface = {
      accountInterventionStatus: sinon.fake.returns({
        data: {
          email: "test@test.com",
          passwordResetRequired: false,
          blocked: false,
          temporarilySuspended: true,
        },
      }),
    } as unknown as AccountInterventionsInterface;
    await accountInterventionsMiddleware(fakeAccountInterventionService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(res.redirect).to.have.been.calledWith(
      PATH_NAMES.UNAVAILABLE_TEMPORARY
    );
  });
});
