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
    html: `
     <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${EmailTo},</p>

          <p> ${EmailText}.</p>

          <p>If you did not request a for this service, please ignore this email or contact support if you have any concerns.</p>

          <p>Thank you,<br>WinkApp</p>
    </div>`,
  };

  return await transporter.sendMail(mailOptions);
};

export default SendEmail;
