const nodemailer = require("nodemailer");
const { emailTemplate, resetPassTemplate } = require("../utils/email.template");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  const newMail = {
    to,
    subject,
    html,
  };

  return await transporter.sendMail(newMail);
};

module.exports = sendMail;