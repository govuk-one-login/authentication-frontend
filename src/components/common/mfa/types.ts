import { ApiResponseResult } from "../../../types";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    emailAddress: string,
    sourceIp: string
  ) => Promise<ApiResponseResult>;
}
