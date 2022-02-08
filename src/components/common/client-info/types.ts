import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface ClientInfoResponse extends DefaultApiResponse {
  clientId: string;
  clientName: string;
  scopes: string[];
  redirectUri: string;
  serviceType: string;
  state: string;
  cookieConsentShared: boolean;
  consentEnabled: boolean;
}

export interface ClientInfoServiceInterface {
  clientInfo: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<ClientInfoResponse>>;
}
