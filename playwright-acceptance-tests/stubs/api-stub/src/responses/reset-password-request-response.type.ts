export interface ResetPasswordRequestResponse {
  status: number;
  body: {
    mfaMethodType: string;
    phoneNumberLastThree: string;
    mfaMethods: {
      id: string;
      mfaMethodType: string;
      priority: string;
      phoneNumber: string;
    }[];
  };
}
