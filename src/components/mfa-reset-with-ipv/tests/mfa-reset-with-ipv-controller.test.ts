import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants";
import {
  mfaResetOpenInBrowserGet,
  mfaResetWithIpvGet,
} from "../mfa-reset-with-ipv-controller";
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

    it("should set the next path as ipv callback", async () => {
      await mfaResetWithIpvGet(fakeMfaResetAuthorizeService(true))(
        req as Request,
        res as Response
      );

      expect(req.session.user.journey.nextPath).to.eq(PATH_NAMES.IPV_CALLBACK);
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

  describe("mfaResetOpenInBrowserGet", async () => {
    it("should render the correct template", async () => {
      await mfaResetOpenInBrowserGet()(req as Request, res as Response);
      expect(res.render).to.have.been.calledWith(
        "mfa-reset-with-ipv/index-open-in-browser-mfa-reset.njk"
      );
    });
  });
});
