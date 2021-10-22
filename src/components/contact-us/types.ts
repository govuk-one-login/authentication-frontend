export interface ContactForm {
  subject: string;
  comment: string;
  email?: string;
  name?: string;
}

export interface ContactUsServiceInterface {
  contactUsSubmitForm: (contactForm: ContactForm) => Promise<void>;
}
