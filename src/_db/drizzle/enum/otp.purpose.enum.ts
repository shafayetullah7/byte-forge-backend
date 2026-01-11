export enum OtpPurpose {
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export type TOtpPurpose = `${OtpPurpose}`;
