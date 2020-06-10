/**
 * send email by templates
 */

const debug = require('debug')('app:send-email');
const { app } = require('../configs/default');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const sendEmail = ({ to, subject, templateData }) => {
  const data = {
    from: `${app.name} <noreply@${app.domain}>`,
    to: to,
    subject: subject,
    // text: 'Testing some Mailgun awesomeness!',
    html: '<b> Test email text </b>',
  };

  mailgun.messages().send(data, function (error, body) {
    debug(body);
  });
};

module.exports = { sendEmail };
