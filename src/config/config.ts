require('dotenv').config()

export const config = {
  production: process.env.PRODUCTION,
  platform: process.env.PLATFORM,
  mongoDbUrl: process.env.MONGODB_URL,
  jwtSecret: process.env.JWT_SECRET,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailGunDomain: process.env.MAILGUN_DOMAIN,
  mailGunSender: process.env.MAILGUN_SENDER,
  paystackAuthorization: process.env.PAYSTACK_AUTHORIZATION,
  paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioApiKey: process.env.TWILIO_API_KEY,
  twilioApiSecret: process.env.TWILIO_API_SECRET,
  environment: process.env.ENVIRONMENT,
};
