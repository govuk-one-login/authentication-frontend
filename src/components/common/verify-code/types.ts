import { JOURNEY_TYPE } from "src/app.constants";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface VerifyCodeInterface {
  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    journeyType?: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
