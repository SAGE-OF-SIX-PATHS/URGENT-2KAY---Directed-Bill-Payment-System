import nodemailer from 'nodemailer';

// Configure the transporter with your email provider
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Send email function
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
