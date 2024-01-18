import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { JOURNEY_TYPE } from "../../../app.constants";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string,
    isResendCodeRequest: boolean,
    userLanguage: string,
    journeyType?: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
