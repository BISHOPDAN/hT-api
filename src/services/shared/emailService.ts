import { compile } from 'handlebars';
import { config } from '../../config/config';
import {
  EmailTemplateId,
  IEmailTemplatePayload,
} from '../../models/interfaces/emailTemplatePayload';
import fs from 'fs';
import path from 'path';
import { createError } from '../../utils/response';

const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey(config.sendGridApiKey);

const Mailgun = require('mailgun.js');
const formData = require('form-data');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: config.mailgunApiKey,
});

const from = {
  name: 'Aegle Health',
  email: 'admin@transfaa.com',
};

export class EmailService {
  public sendEmail(
    email: string,
    subject: string,
    text: string,
    emailTemplatePayload?: IEmailTemplatePayload
  ) {
    new Promise(async (accept, reject) => {
      try {
        let mailPath: string;
        switch (emailTemplatePayload?.templateId) {
          case EmailTemplateId.EMAIL_VERIFICATION_CODE:
            mailPath = '../../mails/email-verification.hbs';
            break;
          case EmailTemplateId.PASSWORD_RESET_CODE:
            mailPath = '../../mails/email-verification.hbs';
            break;
        }
        accept(
          await this.proceedToSendEmail(
            email,
            subject,
            text,
            mailPath,
            emailTemplatePayload?.data
          )
        );
      } catch (e) {
        reject(e);
      }
    })
      .then((value) => {
        console.log('Email sent: ', value);
      })
      .catch((err) => {
        console.error('Email send error: ', err);
      });
  }

  public async proceedToSendEmail(
    email: string,
    subject: string,
    text: string,
    mailPath?: string,
    data?: { key: string; value: string }[]
  ) {
    let html: string;
    if (!!mailPath && !!data) {
      const emailTemplateSource = fs.readFileSync(
        path.join(__dirname, mailPath),
        'utf8'
      );
      console.log('>>> Email template source: ', emailTemplateSource);
      const body = {};
      data.forEach((value) => {
        body[value.key] = value.value;
      });
      console.log('>>> Email body: ', body);
      const template = compile(emailTemplateSource);
      html = template(body);
    }
    console.log('>>> Email html: ', html);
    return await mg.messages.create(config.mailGunDomain, {
      from: `Aegle <${config.mailGunSender}>`,
      to: email,
      subject: subject,
      text: text,
      html,
    });
  }
}
