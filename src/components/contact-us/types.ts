export interface ContactForm {
  subject: string;
  descriptions: Descriptions;
  email?: string;
  name?: string;
  themes: Themes;
  optionalData: OptionalData;
  feedbackContact: boolean;
  questions: Questions;
  themeQuestions: ThemeQuestions;
  referer: string;
  securityCodeSentMethod?: string;
  identityDocumentUsed?: string;
}

export interface OptionalData {
  userAgent: string;
  ticketIdentifier?: string;
  appSessionId?: string;
  appErrorCode?: string;
}

export interface Questions {
  issueDescription?: string;
  additionalDescription?: string;
  optionalDescription?: string;
  moreDetailDescription?: string;
  radioButtons?: string;
  serviceTryingToUse?: string;
}

export interface ThemeQuestions {
  themeQuestion: string;
  subthemeQuestion?: string;
}

export interface Descriptions {
  issueDescription?: string;
  additionalDescription?: string;
  optionalDescription?: string;
  moreDetailDescription?: string;
  serviceTryingToUse?: string;
}

export interface Themes {
  theme: string;
  subtheme?: string;
}

export interface ContactUsServiceInterface {
  contactUsSubmitForm: (contactForm: ContactForm) => Promise<void>;
}
