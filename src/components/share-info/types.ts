export interface ShareInfoServiceInterface {
  updateProfile: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    consentValue: boolean,
    sourceIp: string
  ) => Promise<boolean>;
  clientInfo: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string
  ) => Promise<ClientInfoResponse>;
}

export interface UpdateUserProfile {
  sessionState: string;
}

export interface ClientInfoResponse {
  clientId: string;
  clientName: string;
  scopes: string[];
}
