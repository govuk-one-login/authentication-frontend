import { expect } from "chai";
import { describe } from "mocha";
import {
  ERROR_CODE_MAPPING,
  ERROR_CODES,
  getErrorPathByCode,
} from "./constants";
import { PATH_NAMES } from "../../app.constants";

describe("getErrorPathByCode", () => {
  for (const [key, value] of Object.entries(ERROR_CODES)) {
    it(`should return the corresponding value from ERROR_CODE_MAPPING for ${key} when no override is provide`, () => {
      expect(getErrorPathByCode(value)).to.eq(
        ERROR_CODE_MAPPING[value.toString()]
      );
    });
  }

  it(`should return the override.path where an override is provided and the override.errorCodeToOverride is equal to the errorCode argument`, () => {
    expect(
      getErrorPathByCode(ERROR_CODES.ACCOUNT_LOCKED, {
        errorCodeToOverride: ERROR_CODES.ACCOUNT_LOCKED,
        path: PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
      })
    ).to.eq(PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED);
  });

  it(`should not return the override.path if an override is provided but the override.errorCodeToOverride is not equal to the errorCode argument`, () => {
    expect(
      getErrorPathByCode(ERROR_CODES.AUTH_APP_INVALID_CODE, {
        errorCodeToOverride: ERROR_CODES.ACCOUNT_LOCKED,
        path: PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
      })
    ).to.not.eq(PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED);
  });
});
