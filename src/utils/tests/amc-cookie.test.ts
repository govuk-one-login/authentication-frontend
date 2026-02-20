import { mockResponse } from "mock-req-res";
import { expect, sinon } from "../../../test/utils/test-utils.js";
import type { Response } from "express";
import { setAmcCookie } from "../amc-cookie.js";
import { describe } from "mocha";

describe("amc-cookie", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("setAmcCookie", () => {
    it("should set amc cookie with SHA256 hash of JWT when request parameter is present", () => {
      const res = mockResponse();
      res.cookie = sinon.spy();
      const redirectUrl =
        "https://test-amc-url.com/authorize?state=test-state&request=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";

      setAmcCookie(redirectUrl, res as unknown as Response);

      expect(res.cookie).to.have.been.calledWith(
        "amc",
        // hash of 'request' jwt value above
        "8bc96795edcbd22567382db5b547a2264a9564a9ac24a60e6122623da1800b32",
        sinon.match({
          secure: true,
          httpOnly: true,
          domain: sinon.match.string,
        })
      );
    });

    it("should not set cookie when request parameter is not present", () => {
      const res = mockResponse();
      res.cookie = sinon.spy();
      const redirectUrl = "https://test-amc-url.com/authorize?state=test-state";

      setAmcCookie(redirectUrl, res as unknown as Response);

      expect(res.cookie).to.not.have.been.called;
    });
  });
});
