import { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../../../test/utils/test-utils";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";

import { sendEmailOtp } from "../send-email-otp-middleware";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { BadRequestError } from "../../../utils/error";

describe("checkAccountRecoveryPermittedMiddleware", () => {
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
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call next when send OTP API call is successful", async () => {
    const fakeNotificationService: SendNotificationServiceInterface = {
      sendNotification: sinon.fake.returns({
        success: true,
      }),
    };

    await sendEmailOtp(
      req as Request,
      res as Response,
      next,
      fakeNotificationService
    );
    expect(next).to.be.calledOnce;
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
    };

    sendEmailOtp(
      req as Request,
      res as Response,
      next,
      fakeNotificationService
    ).then((resp) => {
      expect(resp).to.throw(BadRequestError);
    });

    expect(next).to.not.be.called;
  });
});
