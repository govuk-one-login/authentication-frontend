import { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../../../test/utils/test-utils";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";

import { checkAccountRecoveryPermitted } from "../check-account-recovery-middleware";
import { PATH_NAMES, MFA_METHOD_TYPE } from "../../../app.constants";

describe("checkAccountRecoveryPermittedMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = mockResponse();
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call next when user is permitted to recover account", () => {
    req = mockRequest({
      session: {
        user: {
          isAccountRecoveryPermitted: true,
        },
      },
    });
    checkAccountRecoveryPermitted(req as Request, res as Response, next);
    expect(next).to.be.calledOnce;
  });

  it("should redirect to enter auth app code screen for auth app type request where user is not permitted to recover account", () => {
    req = mockRequest({
      session: {
        user: {
          isAccountRecoveryPermitted: false,
        },
      },
      query: {
        type: MFA_METHOD_TYPE.AUTH_APP,
      },
    });

    checkAccountRecoveryPermitted(req as Request, res as Response, next);
    expect(next).to.not.be.called;
    expect(res.redirect).to.have.been.calledOnceWith(
      PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
    );
  });

  it("should redirect to 'account recovery blocked for 48hrs' explanation screen for SMS type request where user is not permitted to recover account", () => {
    req = mockRequest({
      session: {
        user: {
          isAccountRecoveryPermitted: false,
        },
      },
      query: {
        type: MFA_METHOD_TYPE.SMS,
      },
    });

    checkAccountRecoveryPermitted(req as Request, res as Response, next);
    expect(next).to.not.be.called;
    expect(res.redirect).to.have.been.calledOnceWith(
      PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
    );
  });

  it("should throw an error for an unknown request type where user is not permitted to recover account", () => {
    req = mockRequest({
      session: {
        user: {
          isAccountRecoveryPermitted: false,
        },
      },
    });

    expect(() =>
      checkAccountRecoveryPermitted(req as Request, res as Response, next)
    ).to.throw(
      "Attempted to access /check-your-email without a valid request type"
    );
    expect(next).to.not.be.called;
  });
});
