import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface CheckEmailFraudBlockInterface {
  checkEmailFraudBlock: (
    email: string,
    sessionId: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<CheckEmailFraudBlockResponse>>;
}

export interface CheckEmailFraudBlockResponse extends DefaultApiResponse {
  email: string;
  isBlockedStatus: string;
}
