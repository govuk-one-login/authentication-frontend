import { describe } from "mocha";
import { mockResponse } from "mock-req-res";
import type { Request, Response } from "express";
import type {
  ApiResponseResult,
  DefaultApiResponse,
} from "../../../src/types.js";
import { ERROR_CODES } from "../../../src/components/common/constants.js";
import { handleSendMfaCodeError } from "../../../src/utils/send-mfa-code-error-helper.js";
import { expect } from "../../utils/test-utils.js";
import { createApiResponse } from "../../../src/utils/http.js";
import { BadRequestError } from "../../../src/utils/error.js";
import { createMockRequest } from "../../helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { getPermittedJourneyForPath } from "../../helpers/session-helper.js";

describe("send mfa code error helper", () => {
  let res: Response;
  let req: Request;
  let result: ApiResponseResult<DefaultApiResponse>;

  beforeEach(() => {
    res = mockResponse();
    req = createMockRequest(
      PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES
    ) as Request;
    req.session.user.journey = getPermittedJourneyForPath(
      PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES
    );
  });

  it("should redirect to cannot-use-security-code for INDEFINITELY_BLOCKED_INTERNATIONAL_SMS", async () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: ERROR_CODES.INDEFINITELY_BLOCKED_INTERNATIONAL_SMS },
    });
    await handleSendMfaCodeError(result, req, res);
    expect(res.redirect).to.have.calledWith(
      PATH_NAMES.CANNOT_USE_SECURITY_CODE
    );
  });

  it("should return render security-code-error/index-wait", async () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED },
    });
    await handleSendMfaCodeError(result, req, res);
    expect(res.render).to.have.calledWith("security-code-error/index-wait.njk");
  });

  it("should return render security-code-error/index-security-code-entered-exceeded", async () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES },
    });
    await handleSendMfaCodeError(result, req, res);
    expect(res.render).to.have.calledWith(
      "security-code-error/index-security-code-entered-exceeded.njk"
    );
  });

  it("should redirect to error path associated with a code", async () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: {
        code: ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_MAX_CODES_SENT,
      },
    });
    await handleSendMfaCodeError(result, req, res);
    expect(res.redirect).to.have.calledWith(
      "/security-code-requested-too-many-times?actionType=changeSecurityCodesEmailMaxCodesSent"
    );
  });

  it("should throw bad request error", async () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: 123456789 },
    });
    try {
      await handleSendMfaCodeError(result, req, res);
      expect.fail("Expected BadRequestError to be thrown");
    } catch (e) {
      expect(e).to.be.instanceOf(BadRequestError);
    }
  });
});
