import { describe } from "mocha";
import { mockResponse } from "mock-req-res";
import type { Response } from "express";
import type {
  ApiResponseResult,
  DefaultApiResponse,
} from "../../../src/types.js";
import { ERROR_CODES } from "../../../src/components/common/constants.js";
import { handleSendMfaCodeError } from "../../../src/utils/send-mfa-code-error-helper.js";
import { expect } from "../../utils/test-utils.js";
import { createApiResponse } from "../../../src/utils/http.js";
import { BadRequestError } from "../../../src/utils/error.js";

describe("send mfa code error helper", () => {
  const res: Response = mockResponse();
  let result: ApiResponseResult<DefaultApiResponse>;

  it("should return render security-code-error/index-wait", () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED },
    });
    handleSendMfaCodeError(result, res);
    expect(res.render).to.have.calledWith("security-code-error/index-wait.njk");
  });

  it("should return render security-code-error/index-security-code-entered-exceeded", () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES },
    });
    handleSendMfaCodeError(result, res);
    expect(res.render).to.have.calledWith(
      "security-code-error/index-security-code-entered-exceeded.njk"
    );
  });

  it("should redirect to error path associated with a code", () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: {
        code: ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_MAX_CODES_SENT,
      },
    });
    handleSendMfaCodeError(result, res);
    expect(res.redirect).to.have.calledWith(
      "/security-code-requested-too-many-times?actionType=changeSecurityCodesEmailMaxCodesSent"
    );
  });

  it("should throw bad request error", () => {
    result = createApiResponse({
      config: undefined,
      headers: undefined,
      status: 0,
      statusText: "",
      data: { code: 123456789 },
    });
    expect(() => {
      handleSendMfaCodeError(result, res);
    }).to.throw(BadRequestError);
  });
});
