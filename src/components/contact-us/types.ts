export interface ContactForm {
  subject: string;
  contents: string[];
  email?: string;
  name?: string;
  tags: string[];
  optionalData: OptionalData;
  feedbackContact: boolean;
}

export interface OptionalData {
  userAgent: string;
  sessionId?: string;
}

export interface ContactUsServiceInterface {
  contactUsSubmitForm: (contactForm: ContactForm) => Promise<void>;
}
