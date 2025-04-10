import { expect } from "chai";
import { describe } from "mocha";
import { getAccountNotFoundTemplate } from "../get-account-not-found-template.js";
import { SERVICE_TYPE } from "../../../app.constants.js";
describe("getAccountNotFoundWebTemplate", () => {
  describe("when isStrategicApp is false", () => {
    describe("when isOneLoginService is true", () => {
      it("should always return 'account-not-found/index-one-login.njk'", () => {
        [SERVICE_TYPE.OPTIONAL, SERVICE_TYPE.MANDATORY].forEach((i) => {
          expect(getAccountNotFoundTemplate(true, i, false)).to.equal(
            "account-not-found/index-one-login.njk"
          );
        });
      });
    });

    describe("when isOneLoginService is false", () => {
      it("should return 'account-not-found/index-optional.njk' when serviceType is equal to SERVICE_TYPE.OPTIONAL", () => {
        expect(
          getAccountNotFoundTemplate(false, SERVICE_TYPE.OPTIONAL, false)
        ).to.equal("account-not-found/index-optional.njk");
      });

      it("should return 'account-not-found/index-mandatory.njk' when serviceType is not equal to SERVICE_TYPE.OPTIONAL", () => {
        [SERVICE_TYPE.MANDATORY, ""].forEach((i) => {
          expect(getAccountNotFoundTemplate(false, i, false)).to.equal(
            "account-not-found/index-mandatory.njk"
          );
        });
      });
    });
  });

  describe("when isStrategicApp is true", () => {
    describe("when isOneLoginService is true", () => {
      it("should always return 'account-not-found/index-mobile.njk'", () => {
        [SERVICE_TYPE.OPTIONAL, SERVICE_TYPE.MANDATORY].forEach((i) => {
          expect(getAccountNotFoundTemplate(true, i, true)).to.equal(
            "account-not-found/index-mobile.njk"
          );
        });
      });
    });

    describe("when isOneLoginService is false", () => {
      it("should return 'account-not-found/index-mobile.njk' when serviceType is equal to SERVICE_TYPE.OPTIONAL", () => {
        expect(
          getAccountNotFoundTemplate(false, SERVICE_TYPE.OPTIONAL, true)
        ).to.equal("account-not-found/index-mobile.njk");
      });

      it("should return 'account-not-found/index-mobile.njk' when serviceType is not equal to SERVICE_TYPE.OPTIONAL", () => {
        [SERVICE_TYPE.MANDATORY, ""].forEach((i) => {
          expect(getAccountNotFoundTemplate(false, i, true)).to.equal(
            "account-not-found/index-mobile.njk"
          );
        });
      });
    });
  });
});
