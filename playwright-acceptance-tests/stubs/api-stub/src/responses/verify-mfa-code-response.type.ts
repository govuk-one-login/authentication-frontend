export interface VerifyMfaCodeResponse {
  status: number;
  body?: {
    code: number;
    message: string;
  };
}
