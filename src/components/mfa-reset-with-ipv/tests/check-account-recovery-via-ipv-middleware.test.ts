import { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../../../test/utils/test-utils";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";

import { PATH_NAMES } from "../../../app.constants";
import { checkAccountRecoveryPermittedViaIpv } from "../check-account-recovery-via-ipv-middleware";

describe("checkAccountRecoveryPermittedViaIpvMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = mockResponse();
    next = sinon.fake() as unknown as NextFunction;
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
      log: { error: sinon.fake(), info: sinon.fake() },
    });
    req.path = PATH_NAMES.ENTER_MFA;
    res.locals.sessionId = "123456-abcdef";
    checkAccountRecoveryPermittedViaIpv(req as Request, res as Response, next);
    expect(next).to.be.calledOnce;
    expect(req.session.user.journey.nextPath).to.eq(
      PATH_NAMES.MFA_RESET_WITH_IPV
    );
  });

  it("should throw an error if user is not permitted to recover account", () => {
    req = mockRequest({
      session: {
        user: {
          isAccountRecoveryPermitted: false,
        },
      },
    });

    expect(() =>
      checkAccountRecoveryPermittedViaIpv(req as Request, res as Response, next)
    ).to.throw(
      "User started IPV reverification journey without being permitted. This should be replaced with an appropriate error page."
    );
    expect(next).to.not.be.called;
  });
});
