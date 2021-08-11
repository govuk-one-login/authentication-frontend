export interface UpdateTermsAndCondsServiceInterface {
    updateProfile: (
        sessionId: string,
        email: string,
        updatedTermsAndCondsValue: boolean
    ) => Promise<boolean>;
    clientInfo: (sessionId: string, clientSessionId: string) => Promise<ClientInfoResponse>;
}

export interface UpdateUserProfile {
    sessionState: string;
}

export interface ClientInfoResponse {
    clientId: string;
    clientName: string;
    scopes: string[];
    redirectUri: string;
}
