import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import {
  HTTP_STATUS_CODES,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants";
import { mfaResetWithIpvGet } from "../mfa-reset-with-ipv-controller";
import { expect } from "chai";
import { MfaResetAuthorizeInterface } from "../types";
import { Request, Response } from "express";
import { BadRequestError } from "../../../utils/error";
import { strict as assert } from "assert";

const IPV_DUMMY_URL =
  "https://test-idp-url.com/callback?code=123-4ddkk0sdkkd-ad";

const fakeMfaResetAuthorizeService = (successfulAuthorizeResponse: boolean) => {
  return {
    ipvRedirectUrl: sinon.fake.returns({
      success: successfulAuthorizeResponse,
      data: {
        authorize_url: successfulAuthorizeResponse ? IPV_DUMMY_URL : null,
        code: successfulAuthorizeResponse
          ? HTTP_STATUS_CODES.OK
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: successfulAuthorizeResponse ? null : "Test error message",
      },
    }),
  } as unknown as MfaResetAuthorizeInterface;
};

describe("mfa reset with ipv controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.MFA_RESET_WITH_IPV);
    res = mockResponse();
    req.session.client.redirectUri =
      "https://oidc.test.account.gov.uk/orchestration-redirect";
    req.session.client.state = "orchestration-state";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("mfaResetWithIpvGet", async () => {
    it("should redirect to ipv when request is made to the MFA Reset Authorize endpoint successfully", async () => {
      await mfaResetWithIpvGet(fakeMfaResetAuthorizeService(true))(
        req as Request,
        res as Response
      );
      expect(res.redirect).to.have.been.calledWith(IPV_DUMMY_URL);
    });

    [
      [MFA_METHOD_TYPE.SMS, PATH_NAMES.ENTER_MFA],
      [MFA_METHOD_TYPE.AUTH_APP, PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE],
    ].forEach(([mfaMethodType, expectedPath]) => {
      it(`should set the next path to "${expectedPath}" for the "${mfaMethodType}" MFA method type`, async () => {
        req.session.user.mfaMethodType = mfaMethodType;

        await mfaResetWithIpvGet(fakeMfaResetAuthorizeService(true))(
          req as Request,
          res as Response
        );

        expect(req.session.user.journey.nextPath).to.eq(expectedPath);
      });
    });

    it("should throw a BadRequestError when the request made to the MFA Reset Authorize endpoint is not successful", async () => {
      await assert.rejects(
        async () =>
          mfaResetWithIpvGet(fakeMfaResetAuthorizeService(false))(
            req as Request,
            res as Response
          ),
        BadRequestError,
        "500:Test error message"
      );
    });
  });
});
