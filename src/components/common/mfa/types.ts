import { NOTIFICATION_TYPE } from "src/app.constants";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string,
    notificationType: NOTIFICATION_TYPE,
    userLanguage: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
