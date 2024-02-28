import { VerifyCodeInterface } from "../../src/components/common/verify-code/types";
import sinon from "sinon";

export function fakeVerifyCodeServiceHelper(success: boolean, code?: any) {
  return {
    verifyCode: sinon.fake.returns({
      success: success,
      data: { code: code },
    }),
  } as unknown as VerifyCodeInterface;
}
