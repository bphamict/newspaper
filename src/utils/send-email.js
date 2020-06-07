/**
 * send email by templates
 */

const debug = require('debug')('app:send-email');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

module.exports = ({ to, subject, templateData }) => {
  const data = {
    from: `${process.env.APP_NAME} <noreply@${process.env.APP_DOMAIN}>`,
    to: to,
    subject: subject,
    text: 'Testing some Mailgun awesomeness!',
    html: '<b> Test email text </b>',
  };

  mailgun.messages().send(data, function (error, body) {
    debug(body);
  });
};
