import { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../../../../test/utils/test-utils.js";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";

import { sendEmailOtp } from "../send-email-otp-middleware.js";
import { SendNotificationServiceInterface } from "../../../common/send-notification/types.js";
import { BadRequestError } from "../../../../utils/error.js";
import { ERROR_CODES } from "../../../common/constants.js";
import { strict as assert } from "assert";

describe("sendEmailOTPMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest({
      session: {
        user: {
          email: "test@test.com",
        },
      },
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
  });

  it("should call next when send OTP API call is successful", async () => {
    const fakeNotificationService: SendNotificationServiceInterface = {
      sendNotification: sinon.fake.returns({
        success: true,
      }),
    } as unknown as SendNotificationServiceInterface;
    await sendEmailOtp(fakeNotificationService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(next).to.be.calledOnce;
  });

  it("should render security-code-error/index-wait.njk if user is locked out due to too many codes requested", async () => {
    const fakeNotificationService: SendNotificationServiceInterface = {
      sendNotification: sinon.fake.returns({
        success: false,
        data: {
          code: ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_CODE_REQUEST_BLOCKED,
        },
      }),
    } as unknown as SendNotificationServiceInterface;
    await sendEmailOtp(fakeNotificationService)(
      req as Request,
      res as Response,
      next as NextFunction
    );
    expect(res.render).to.be.calledWith("security-code-error/index-wait.njk");
  });

  it("should throw a BadRequestError when send OTP API call is unsuccessful", async () => {
    const UNKNOWN_ERROR_CODE = "999999999999999";
    const TEST_ERROR_MESSAGE = "test error message";
    const fakeNotificationService: SendNotificationServiceInterface = {
      sendNotification: sinon.fake.returns({
        success: false,
        data: {
          message: TEST_ERROR_MESSAGE,
          code: UNKNOWN_ERROR_CODE,
        },
      }),
    } as unknown as SendNotificationServiceInterface;

    await assert.rejects(
      async () =>
        sendEmailOtp(fakeNotificationService)(
          req as Request,
          res as Response,
          next as NextFunction
        ),
      BadRequestError,
      "999999999999999:test error message"
    );

    expect(next).to.not.be.called;
  });
});
