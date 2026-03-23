import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import type { AmcAuthorizeInterface } from "../types.js";
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
import { amcAuthorizeService } from "../amc-authorize-service.js";
import { expect } from "chai";

describe("amc authorize service", () => {
  const http = new Http();
  const service: AmcAuthorizeInterface = amcAuthorizeService(http);
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

  const JOURNEY_TYPES = [
    AMC_JOURNEY_TYPES.SINGLE_FACTOR_ACCOUNT_DELETION,
    AMC_JOURNEY_TYPES.PASSKEY_CREATE,
  ];
  for (const journeyType of JOURNEY_TYPES) {
    it(`successfully calls the AMC authorize API with ${journeyType} journey type`, async () => {
      const result = await service.getRedirectUrl(
        sessionId,
        clientSessionId,
        diPersistentSessionId,
        req,
        journeyType
      );

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.AMC_AUTHORIZE,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: {
          journeyType: journeyType,
        },
      };

      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        true,
        expectedApiCallDetails
      );
      expect(result.success).to.equal(true);
    });
  }
});
