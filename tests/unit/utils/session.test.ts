import { expect } from "chai";
import { describe } from "mocha";
import { createSession, isSessionValid } from "../../../src/utils/session";
import { UserSession } from "../../../src/types/user-session";

describe("session", () => {
  describe("isSessionValid", () => {
    it("should return true when valid session", () => {
      const userSession: UserSession = {
        id: "12sadjk",
        email: "test@test.com",
        scope: "openid",
      };

      const isValid = isSessionValid(userSession);

      expect(isValid).to.be.true;
    });
    it("should return false when empty session", () => {
      const userSession: any = {};

      const isValid = isSessionValid(userSession);

      expect(isValid).to.be.false;
    });
    it("should return false when undefined session", () => {
      const isValid = isSessionValid(undefined);

      expect(isValid).to.be.false;
    });
    it("should return false when session is null", () => {
      const isValid = isSessionValid(null);

      expect(isValid).to.be.false;
    });
  });

  describe("createSession", () => {
    it("should return user session", () => {
      const userSession = createSession("1245-daks", "openid");

      expect(userSession).to.have.property("id");
      expect(userSession).to.have.property("scope");
    });
  });
});
