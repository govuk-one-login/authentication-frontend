import { redactPhoneNumber } from "../../src/utils/strings.js";
export const commonVariables = {
  email: "joe.bloggs@example.com",
  sessionId: "123456-djjad",
  diPersistentSessionId: "dips-123456-abc",
  journeyId: "00000-djjad",
  ip: "123.123.123.123",
  apiKey: "apiKey",
  auditEncodedString:
    "R21vLmd3QilNKHJsaGkvTFxhZDZrKF44SStoLFsieG0oSUY3aEhWRVtOMFRNMVw1dyInKzB8OVV5N09hOi8kLmlLcWJjJGQiK1NPUEJPPHBrYWJHP358NDg2ZDVc",
  testPhoneNumber: "0123456789",
  testRedactedPhoneNumber: redactPhoneNumber("0123456789"),
};
