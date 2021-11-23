import { ApiResponseResult } from "../../../types";

export interface ClientInfoResponse extends ApiResponseResult {
  data: ClientInfo;
}

export interface ClientInfo {
  clientId: string;
  clientName: string;
  scopes: string[];
  redirectUri: string;
  serviceType: string;
  state: string;
}

export interface ClientInfoServiceInterface {
  clientInfo: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ClientInfoResponse>;
}
