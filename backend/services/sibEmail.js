const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;

// Configure API key
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, uuid) => {
  const emailData = {
    sender: {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME,
    },
    to: [{ email: to }],
    subject: "Reset password link",
    htmlContent: `
    <h1>Click the link below to create new password</h1>
    <a href='http://localhost:3000/resetPassword/${uuid}'>Reset Password</a>
    `,
  };

  try {
    await transactionalApi.sendTransacEmail(emailData);
  } catch (error) {
    console.error("Sendinblue error:", error);
    throw error;
  }
};

module.exports = sendEmail;
