export const VALID_PASSWORD = "valid-password-1";

export const INVALID_PASSWORD = "invalid-password";

// Satisfies local rules (contains a digit, 8+ chars, not digits-only)
// reaches the backend, which rejects it as a common password.
export const WEAK_PASSWORD = "Password1";

export const SHORT_NUMERIC_PASSWORD = "1234";

export const SEQUENTIAL_NUMBERS_PASSWORD = "12345678";

export const EMAIL = "user@example.com";

export const INVALID_EMAIL = "joe.bloggs";

export const UK_PHONE_NUMBER = "07700900000";

export const UK_PHONE_NUMBER_INTERNATIONAL = "+447700900000";

export const TEST_EMAIL = {
  SMS_USER: "test@example.com",
  AUTH_APP_USER: "authapp@example.com",
  NEW_USER: "newuser@example.com",
  PASSKEY_USER: "passkey@example.com",
} as const;
