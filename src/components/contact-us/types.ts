export interface ContactForm {
  subject: string;
  comment: string;
  email?: string;
  name?: string;
  optionalData: OptionalData;
}

export interface OptionalData {
  userAgent: string;
  sessionId?: string;
}

export interface ContactUsServiceInterface {
  contactUsSubmitForm: (contactForm: ContactForm) => Promise<void>;
}
