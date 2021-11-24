import { ApiResponseResult } from "../../../types";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult>;
}
