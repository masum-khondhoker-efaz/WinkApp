import nodemailer from 'nodemailer';
import {
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_SECURITY,
  EMAIL_UN_AUTHORIZATION,
  EMAIL_USER,
} from '../config/config.js';

const SendEmail = async (EmailTo, EmailText, EmailSubject) => {
  //let transporter = nodemailer.createTransport({
  // host: EMAIL_HOST,
  //  port:EMAIL_PORT,
  //   secure: EMAIL_SECURITY,
  //  auth:{
  //      user: EMAIL_USER,
  //      pass: EMAIL_PASSWORD,
  //  },
  //  tls:{
  //      rejectUnauthorized: EMAIL_UN_AUTHORIZATION
  //  }

  // })

  //const transporter = nodemailer.createTransport({
  //    host: "mail.themesoft69.com",
  //   port: 465,
  //   secure: true, // Use `true` for port 465, `false` for all other ports
  //  auth: {
  //      user: "mern_ostad@themesoft69.com",
  //      pass: "h4e24DFTj6v)",
  //  },
  //});

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: EMAIL_PORT,
    secure: EMAIL_SECURITY,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: EMAIL_UN_AUTHORIZATION,
    }
  });

  let mailOptions = {
    from: 'WinkApp OTP From <EMAIL_USER>',
    to: EmailTo,
    subject: EmailSubject,
    text: EmailText,
  };

  return await transporter.sendMail(mailOptions);
};

export default SendEmail;
