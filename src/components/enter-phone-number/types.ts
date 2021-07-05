export interface EnterPhoneNumberServiceInterface {
  sendPhoneVerificationNotification: (
    sessionId: string,
    email: string,
    phoneNumber: string
  ) => Promise<void>;
  updateProfile: (
    sessionId: string,
    email: string,
    phoneNumber: string
  ) => Promise<boolean>;
}

export interface UpdateUserProfile {
  sessionState: string;
}
