import { describe } from "mocha";
import { sinon } from "../../../../../test/utils/test-utils.js";
import type { AccountRecoveryInterface } from "../types.js";
import { isAccountRecoveryPermitted } from "../account-recovery-helper.js";
import { mockResponse } from "mock-req-res";
import { expect } from "chai";
import { strict as assert } from "assert";
import { BadRequestError } from "../../../../utils/error.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";

describe("account recovery helper", () => {
  const testReq = createMockRequest("/");
  testReq.session.user = { email: "test@example.com" };

  const testRes = mockResponse();
  testRes.locals.sessionId = "testSessionId";
  testRes.locals.clientSessionId = "testClientSessionId";
  testRes.locals.persistentSessionId = "testPersistentSessionId";

  it("should return true when account recovery request is successful", async () => {
    const response = await isAccountRecoveryPermitted(
      testReq,
      testRes,
      fakeAccountRecoveryService(true)
    );

    expect(response).to.be.true;
  });

  it("should return false when account recovery request is unsuccessful", async () => {
    const response = await isAccountRecoveryPermitted(
      testReq,
      testRes,
      fakeAccountRecoveryService(false)
    );

    expect(response).to.be.false;
  });

  it("should throw error if account recovery response is unsuccessful", async () => {
    await assert.rejects(
      async () =>
        isAccountRecoveryPermitted(
          testReq,
          testRes,
          fakeAccountRecoveryService(true, false)
        ),
      BadRequestError,
      `${TEST_ERROR_CODE}:${TEST_ERROR_MESSAGE}`
    );
  });
});

const TEST_ERROR_MESSAGE = "Test error message";
const TEST_ERROR_CODE = "TestErrorCode";

export const fakeAccountRecoveryService = (
  accountRecoveryPermitted: boolean,
  success = true
) => {
  return {
    accountRecovery: sinon.fake.returns({
      success,
      ...(success
        ? { data: { accountRecoveryPermitted: accountRecoveryPermitted } }
        : { data: { message: TEST_ERROR_MESSAGE, code: TEST_ERROR_CODE } }),
    }),
  } as unknown as AccountRecoveryInterface;
};
