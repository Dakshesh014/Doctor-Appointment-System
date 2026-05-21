const sendEmail = async ({ to, subject, text, html }) => {
  console.log(`[Email Service Mock] Sending email to: ${to}`);
  console.log(`[Email Service Mock] Subject: ${subject}`);
  return true;
};

module.exports = {
  sendEmail
};
