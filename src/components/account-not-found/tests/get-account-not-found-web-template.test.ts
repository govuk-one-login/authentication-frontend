import { expect } from "chai";
import { describe } from "mocha";
import { getAccountNotFoundWebTemplate } from "../get-account-not-found-web-template";
import { SERVICE_TYPE } from "../../../app.constants";

describe("getAccountNotFoundWebTemplate", () => {
  describe("when isOneLoginService is true", () => {
    it("should always return 'account-not-found/index-one-login.njk'", () => {
      [SERVICE_TYPE.OPTIONAL, SERVICE_TYPE.MANDATORY].forEach((i) => {
        expect(getAccountNotFoundWebTemplate(true, i)).to.equal(
          "account-not-found/index-one-login.njk"
        );
      });
    });
  });

  describe("when isOneLoginService is false", () => {
    it("should return 'account-not-found/index-optional.njk' when serviceType is equal to SERVICE_TYPE.OPTIONAL", () => {
      expect(
        getAccountNotFoundWebTemplate(false, SERVICE_TYPE.OPTIONAL)
      ).to.equal("account-not-found/index-optional.njk");
    });

    it("should return 'account-not-found/index-mandatory.njk' when serviceType is not equal to SERVICE_TYPE.OPTIONAL", () => {
      [SERVICE_TYPE.MANDATORY, ""].forEach((i) => {
        expect(getAccountNotFoundWebTemplate(false, i)).to.equal(
          "account-not-found/index-mandatory.njk"
        );
      });
    });
  });
});
