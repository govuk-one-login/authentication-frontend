import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import { Http } from "../../../../utils/http.js";
import type { UpdateProfileServiceInterface } from "../types.js";
import { UpdateType } from "../types.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../../app.constants.js";
import { updateProfileService } from "../update-profile-service.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../../test/helpers/common-test-variables.js";
describe("update profile service", () => {
  const httpInstance = new Http();
  const service: UpdateProfileServiceInterface = updateProfileService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to update a profile", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, email, diPersistentSessionId } = commonVariables;
    const req = createMockRequest(PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const profileInformation = true;
    const updateProfileType = UpdateType.CAPTURE_CONSENT;

    const result = await service.updateProfile(
      sessionId,
      clientSessionId,
      email,
      { profileInformation, updateProfileType },
      diPersistentSessionId,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.UPDATE_PROFILE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email, profileInformation, updateProfileType },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
