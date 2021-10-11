export interface ContactForm {
  subject: string;
  comment: string;
  email?: string;
}

export interface ContactUsServiceInterface {
  contactUsSubmitForm: (contactForm: ContactForm) => Promise<void>;
}
