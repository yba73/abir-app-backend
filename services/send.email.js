import nodemailer from "nodemailer";

const sendMail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWROD_GMAIL,
      },
    });
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html,
    };

    transporter.sendMail(mailOption, (error, success) => {
      if (error) {
        throw new Error(`error send email is ${error}`);
      }
    });
  } catch (error) {
    throw new Error(`send email error is ${error}`);
  }
};

export default sendMail;
