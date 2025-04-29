import type { VerifyCodeInterface } from "../../src/components/common/verify-code/types.js";
import sinon from "sinon";

export function fakeVerifyCodeServiceHelper(
  success: boolean,
  code?: any
): VerifyCodeInterface {
  return {
    verifyCode: sinon.fake.returns({
      success: success,
      data: { code: code },
    }),
  } as unknown as VerifyCodeInterface;
}
