import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import { Http } from "../../../utils/http.js";
import { DocCheckingAppInterface } from "../types.js";
import { docCheckingAppService } from "../doc-checking-app-service.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
describe("mfa service", () => {
  const httpInstance = new Http();
  const service: DocCheckingAppInterface = docCheckingAppService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to make a doc checking app request", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.OK,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, diPersistentSessionId } =
      commonVariables;
    const req = createMockRequest(PATH_NAMES.DOC_CHECKING_APP, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: {},
    };

    const result = await service.docCheckingAppAuthorize(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req
    );

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
