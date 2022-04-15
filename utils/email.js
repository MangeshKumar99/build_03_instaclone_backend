const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
     service:"gmail",
      auth: {
        user: process.env.YOUR_GMAILID,
        pass: process.env.YOUR_GMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.YOUR_GMAILID,
      to: email,
      subject: subject,
      text: text,
    });
    return "email sent sucessfully";
  } catch (error) {
    console.log(error);
    return "email not sent";
  }
};

module.exports = sendEmail;
