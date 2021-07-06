export interface CheckYourPhoneNumberService {
  verifyPhoneNumber: (sessionId: string, code: string) => Promise<boolean>;
}
