import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { PATH_NAMES } from "../../../app.constants";
import { expect } from "chai";
import { Request, Response } from "express";
import {
  cannotChangeSecurityCodesGet,
  ipvCallbackGet,
} from "../ipv-callback-controller";
import {
  ReverificationResultFailedResponse,
  ReverificationResultInterface,
} from "../types";
import { BadRequestError } from "../../../utils/error";
import { commonVariables } from "../../../../test/helpers/common-test-variables";
import { strict as assert } from "assert";
import { describe } from "mocha";

const reverificationResultService = (status: number, data: object) => {
  return {
    getReverificationResult: sinon.fake.returns({
      success: status < 300 && status >= 200,
      data: data,
    }),
  } as unknown as ReverificationResultInterface;
};

const reverificationResultFailureData = (failureCode: string) => {
  return {
    sub: "some-sub",
    success: false,
    failure_code: failureCode,
    failure_description: "some-description",
    code: 200,
    message: "",
  } as ReverificationResultFailedResponse;
};

const reverificationSuccessData = {
  sub: "some-sub",
  success: true,
  code: 200,
  message: "",
};

const failureData = {
  code: 500,
  message: "Internal error occurred in backend",
};

describe("ipv callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const { sessionId, clientSessionId, diPersistentSessionId, email } =
    commonVariables;

  const AUTH_CODE = "5678";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.IPV_CALLBACK);
    req.query = { code: AUTH_CODE };
    req.session.user.email = email;
    res = mockResponse();
    res.locals = {
      sessionId,
      clientSessionId,
      persistentSessionId: diPersistentSessionId,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("ipv callback get", () => {
    it("get should redirect to GET_SECURITY_CODES when the reverification result is successful", async () => {
      const fakeServiceReturningSuccess = reverificationResultService(
        200,
        reverificationSuccessData
      );
      await ipvCallbackGet(fakeServiceReturningSuccess)(
        req as Request,
        res as Response
      );

      expect(
        fakeServiceReturningSuccess.getReverificationResult
      ).to.have.been.calledWith(
        sessionId,
        clientSessionId,
        diPersistentSessionId,
        req,
        email,
        AUTH_CODE
      );
      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.GET_SECURITY_CODES
      );
    });

    it("get should raise error when reverification result is not successful", async () => {
      const fakeServiceReturningFailure = reverificationResultService(
        500,
        failureData
      );

      await assert.rejects(
        async () =>
          ipvCallbackGet(fakeServiceReturningFailure)(
            req as Request,
            res as Response
          ),
        BadRequestError,
        "500:Internal error occurred in backend"
      );

      expect(fakeServiceReturningFailure.getReverificationResult).to.have.been
        .called;
    });

    const ERROR_CODES_REDIRECTING_TO_CANNOT_CHANGE_SECURITY_CODES = [
      "no_identity_available",
      "identity_check_incomplete",
    ];
    ERROR_CODES_REDIRECTING_TO_CANNOT_CHANGE_SECURITY_CODES.forEach(
      (errorCode) => {
        it(`get should redirect to you cannot change how you get security codes page when result is successful but failure code is ${errorCode}`, async () => {
          const fakeService = reverificationResultService(
            200,
            reverificationResultFailureData(errorCode)
          );

          await ipvCallbackGet(fakeService)(req as Request, res as Response);

          expect(res.redirect).to.be.calledWith(
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
          );
        });
      }
    );

    const ERROR_CODES_RAISING_BAD_REQUEST_ERROR = [
      "identity_did_not_match",
      "identity_check_failed",
    ];
    ERROR_CODES_RAISING_BAD_REQUEST_ERROR.forEach((errorCode) => {
      it(`get should raise error when result is successful but failure code is ${errorCode}`, async () => {
        const fakeService = reverificationResultService(
          200,
          reverificationResultFailureData(errorCode)
        );

        await assert.rejects(
          async () =>
            ipvCallbackGet(fakeService)(req as Request, res as Response),
          {
            name: "Error",
            message: `${errorCode}`,
          }
        );
      });
    });

    it("get should raise error when auth code param is missing or invalid", async () => {
      const missingOrInvalidQueries = [
        {
          query: {},
          expectedMessage: "400:Request query missing auth code param",
        },
        {
          query: { code: ["string-in-a-list"] },
          expectedMessage: "400:Invalid auth code param type",
        },
      ];

      for (const testCase of missingOrInvalidQueries) {
        const fakeServiceReturningSuccess = reverificationResultService(
          200,
          reverificationSuccessData
        );
        req.query = testCase.query;

        await assert.rejects(
          async () =>
            ipvCallbackGet(fakeServiceReturningSuccess)(
              req as Request,
              res as Response
            ),
          BadRequestError,
          testCase.expectedMessage
        );
      }
    });

    describe("cannotChangeSecurityCodeGet", () => {
      it("should render the correct template", () => {
        cannotChangeSecurityCodesGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "ipv-callback/index-cannot-change-how-get-security-codes.njk"
        );
      });
    });
  });
});
