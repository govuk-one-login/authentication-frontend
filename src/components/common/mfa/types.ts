import { ApiResponseResult } from "../../../types";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    emailAddress: string
  ) => Promise<ApiResponseResult>;
}
