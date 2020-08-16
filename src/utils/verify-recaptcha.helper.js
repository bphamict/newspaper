const axios = require('axios');

/**
 * Middleware: verify recaptcha
 * @param {*} response
 * @param {*} remoteip
 */
module.exports = async (response, remoteip) =>
  new Promise((resolve, reject) => {
    axios
      .post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: response,
          remoteip: remoteip,
        },
      })
      .then((res) => {
        res.data.success === true ? resolve(res.data) : reject(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
