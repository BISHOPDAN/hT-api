export enum EmailTemplateId {
  PASSWORD_RESET_CODE = 'd-f7024fc79cb343b0979a495191c9736c',
  EMAIL_VERIFICATION_CODE = 'd-32a44a1b72894e0fb2ce2cbb4ec379d6',
}

export interface IEmailTemplatePayload {
  templateId: EmailTemplateId;
  data: { key: string; value: string }[];
}
