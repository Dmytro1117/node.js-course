const nodemailer = require("nodemailer");

const { BREVO_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "moiseenkodmitriy@i.ua",
    pass: BREVO_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
  try {
    const email = { ...data, from: "moiseenkodmitriy@i.ua" };
    await transport.sendMail(email);
    console.log("Email send success");
    return true;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
