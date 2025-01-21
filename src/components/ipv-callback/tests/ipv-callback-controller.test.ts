import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants";
import { expect } from "chai";
import { Request, Response } from "express";
import {
  cannotChangeSecurityCodesGet,
  cannotChangeSecurityCodesPost,
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
    req.session.id = sessionId;
    req.cookies.gs = sessionId + clientSessionId;
    req.cookies.aps = sessionId;
    req.session.user.journey = {
      nextPath: PATH_NAMES.IPV_CALLBACK,
      optionalPaths: [],
    };
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
      ["no_identity_available", PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES],
      ["identity_check_incomplete", PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES],
      [
        "identity_did_not_match",
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
      ],
      [
        "identity_check_failed",
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
      ],
    ];
    ERROR_CODES_REDIRECTING_TO_CANNOT_CHANGE_SECURITY_CODES.forEach(
      ([errorCode, expectedPath]) => {
        it(`get should redirect you to the ${expectedPath} page when result is successful but failure code is ${errorCode}`, async () => {
          const fakeService = reverificationResultService(
            200,
            reverificationResultFailureData(errorCode)
          );

          await ipvCallbackGet(fakeService)(req as Request, res as Response);

          expect(req.session.user.isAccountRecoveryJourney).to.equal(false);
          expect(res.redirect).to.be.calledWith(expectedPath);
        });
      }
    );

    it(`get should raise error when result is successful but failure code is invalid`, async () => {
      const fakeService = reverificationResultService(
        200,
        reverificationResultFailureData("this_is_an_invalid_failure_code")
      );

      await assert.rejects(
        async () =>
          ipvCallbackGet(fakeService)(req as Request, res as Response),
        {
          name: "Error",
          message: "this_is_an_invalid_failure_code",
        }
      );
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

    describe("cannotChangeSecurityCodePost", () => {
      it("should redirect to contactUsLinkUrl when help-to-delete-account selected", () => {
        const TEST_CONTACT_US_LINK_URL = "https://example.com/contact-us";
        res.locals.contactUsLinkUrl = TEST_CONTACT_US_LINK_URL;
        req.body.cannotChangeHowGetSecurityCodeAction =
          "help-to-delete-account";

        cannotChangeSecurityCodesPost(req as Request, res as Response);

        expect(res.redirect).to.have.been.calledWith(TEST_CONTACT_US_LINK_URL);
      });

      it("should redirect to enter sms mfa page when sms mfa user selects 'ry entering a security code again with the method you already have set up' radio button", async () => {
        req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES;
        req.body.cannotChangeHowGetSecurityCodeAction =
          CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE;
        req.session.user.mfaMethodType = MFA_METHOD_TYPE.SMS;

        await cannotChangeSecurityCodesPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
      });

      it("should redirect to enter auth app mfa page when auth app mfa user selects 'ry entering a security code again with the method you already have set up' radio button", async () => {
        req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES;
        req.body.cannotChangeHowGetSecurityCodeAction =
          CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE;
        req.session.user.mfaMethodType = MFA_METHOD_TYPE.AUTH_APP;

        await cannotChangeSecurityCodesPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
        );
      });
    });
  });
});
