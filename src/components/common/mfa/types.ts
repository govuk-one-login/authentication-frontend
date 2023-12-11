import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string,
    isResendCodeRequest: boolean,
    userLanguage: string,
    journeyType?: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
