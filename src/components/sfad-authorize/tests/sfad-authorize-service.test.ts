import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import type { SfadAuthorizeInterface } from "../types.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import {
  AMC_JOURNEY_TYPES,
  API_ENDPOINTS,
  PATH_NAMES,
} from "../../../app.constants.js";
import { Http } from "../../../utils/http.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { sfadAuthorizeService } from "../sfad-authorize-service.js";
import { expect } from "chai";

describe("sfad authorize service", () => {
  const http = new Http();
  const service: SfadAuthorizeInterface = sfadAuthorizeService(http);
  let postStub: SinonStub;
  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const req = createMockRequest(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const axiosResponse = Promise.resolve({
    data: {},
    status: 200,
    statusText: "OK",
  });

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(http.client, "post");
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the AMC authorize API with SFAD journey type", async () => {
    const result = await service.getRedirectUrl(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.AMC_AUTHORIZE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { journeyType: AMC_JOURNEY_TYPES.SFAD },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
    expect(result.success).to.equal(true);
  });
});
