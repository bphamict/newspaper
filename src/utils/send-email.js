/**
 * send email by templates
 */

const debug = require('debug')('app:send-email');
const { app, authentication } = require('../configs/default');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const sendEmail = ({ to, subject, type, templateData }) => {
  let url = '';
  if (type === authentication.typeOfCode.CONFIRM_ACCOUNT) {
    url = `https://${app.domain}/auth/confirm-account?code=${templateData.code}`;
  } else if (type === authentication.typeOfCode.RESET_PASSWORD) {
    url = `https://${app.domain}/auth/reset-password?code=${templateData.code}`;
  }
  const data = {
    from: `${app.name} <noreply@${app.domain}>`,
    to: to,
    subject: subject,
    // text: 'Testing some Mailgun awesomeness!',
    html: `<a href='${url}'>${url}</a>`,
  };

  mailgun.messages().send(data, function (error, body) {
    debug(body);
  });
};

module.exports = { sendEmail };
