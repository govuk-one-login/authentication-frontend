import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { JOURNEY_TYPE } from "../../../app.constants";

export interface VerifyCodeInterface {
  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    journeyType: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
