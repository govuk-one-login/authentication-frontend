import { sinon } from "../utils/test-utils";
import { mockRequest, RequestOutput } from "mock-req-res";

export function createMockRequest(pathName: string): RequestOutput {
  return mockRequest({
    path: pathName,
    session: {
      client: {},
      user: {},
      save: (callback: () => void) => callback(),
    },
    log: {
      info: sinon.fake(),
      debug: sinon.fake(),
      warn: sinon.fake(),
      error: sinon.fake(),
    },
    t: sinon.fake(),
    i18n: { language: "en" },
  });
}
