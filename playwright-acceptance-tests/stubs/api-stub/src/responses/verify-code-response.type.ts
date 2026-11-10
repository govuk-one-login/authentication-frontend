export interface VerifyCodeResponse {
  status: number;
  body?: {
    code: number;
    message: string;
  };
}
