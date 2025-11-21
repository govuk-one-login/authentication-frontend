import { sinon } from "../utils/test-utils.js";
import type { RequestOutput } from "mock-req-res";
import { mockRequest } from "mock-req-res";

export interface MockRequestOptions {
  headers?: any;
  session?: any;
  cookies?: any;
}

export function createMockRequest(
  pathName: string,
  options?: MockRequestOptions
): RequestOutput {
  const request = mockRequest({
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
      setBindings: sinon.fake(),
    },
    t: sinon.fake(),
    i18n: { language: "en" },
    headers: {},
  });
  if (options?.headers) {
    request.headers = options.headers;
  }
  if (request.headers["x-forwarded-for"]) {
    request.ip = options?.headers["x-forwarded-for"];
  }
  if (options?.session) {
    request.session = options.session;
  }
  if (options?.cookies) {
    request.cookies = options.cookies;
  }
  return request;
}
