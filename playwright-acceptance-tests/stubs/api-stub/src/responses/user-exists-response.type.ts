export interface UserExistsResponse {
  status: number;
  body: {
    email: string;
    doesUserExist: boolean;
    hasActivePasskey?: boolean;
  };
}
