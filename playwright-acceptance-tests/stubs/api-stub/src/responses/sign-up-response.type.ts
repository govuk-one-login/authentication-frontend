export interface SignUpResponse {
  status: number;
  body?: {
    email?: string;
    consentRequired?: boolean;
    code?: number;
    message?: string;
  };
}
