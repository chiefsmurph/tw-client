const gmailSend = require('gmail-send');
const { gmail: credentials, email } = require('../config');
// console.log({credentials })
const send = gmailSend({
  user: credentials.username,
  pass: credentials.password
});


const sendSingle = (subject, text = '', to, files = []) => 
  new Promise((resolve, reject) => {
      console.log(`sending email...to ${to}...`);
      console.log('subject', subject, 'text', text.slice(0, 20));
      send({
          subject: `tw-client: ${subject}`,
          text,
          to,
          files
      }, (err, res) => err ? console.error(err) && resolve() : resolve(res));
  });


module.exports = async (subject, text = '', to = [credentials.username, email], files = []) => {

  to = Array.isArray(to) ? to : [to];
  for (let addr of to) {
    await sendSingle(subject, text, addr, files);
  }

}
