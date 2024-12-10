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
  preferredLanguage?: string;
  securityCodeSentMethod?: string;
  identityDocumentUsed?: string;
  problemWith?: string;
  fromURL?: string;
}

export interface OptionalData {
  userAgent: string;
  ticketIdentifier?: string;
  appSessionId?: string;
  appErrorCode?: string;
  country?: string;
  location?: string;
}

export interface Questions {
  issueDescription?: string;
  additionalDescription?: string;
  optionalDescription?: string;
  moreDetailDescription?: string;
  radioButtons?: string;
  serviceTryingToUse?: string;
  countryPhoneNumberFrom?: string;
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
  countryPhoneNumberFrom?: string;
  problemWithNationalInsuranceNumber?: string;
}

export interface Themes {
  theme: string;
  subtheme?: string;
}

export interface SmartAgentCustomAttributes {
  "sa-ticket-id"?: string;
  "sa-tag-customer-name"?: string;
  "sa-tag-customer-email"?: string;
  "sa-tag-telephone-number"?: string;
  "sa-tag-primary-intent-user-selection"?: string;
  "sa-useragent"?: string;
  "sa-identity-document"?: string;
  "sa-webformrefer"?: string;
  "sa-security-code-sent-method"?: string;
  "sa-tag-secondary-reason-user-selection"?: string;
  "sa-themequestion"?: string;
  "sa-subthemequestion"?: string;
  "sa-additional-description"?: string;
  "sa-more-detailed-description"?: string;
  "sa-optional-description"?: string;
  "sa-issue-description"?: string;
  "sa-tag-what-gov-service"?: string;
  "sa-tag-permission-to-email"?: string;
  "sa-tag-preferred-language"?: string;
  "sa-tag-identifier"?: string;
  "sa-tag-theme"?: string;
  "sa-tag-subtheme"?: string;
  "sa-app-error-code"?: string;
  "sa-security-mobile-country"?: string;
  "sa-tag-building-society"?: string;
  "sa-tag-national-insurance-number"?: string;
  "sa-tag-location"?: string;
}

export interface SmartAgentTicket {
  email?: string;
  message: string;
  customAttributes?: SmartAgentCustomAttributes;
}
