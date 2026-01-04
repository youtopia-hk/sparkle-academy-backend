import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Sparkle Education" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendContactEmail = async (
  name: string,
  email: string,
  message: string,
  phone?: string
): Promise<void> => {
  const contactEmail = process.env.CONTACT_EMAIL_TO || process.env.EMAIL_USER;

  const phoneHtml = phone ? `<p><strong>Phone:</strong> ${phone}</p>` : '';
  const phoneText = phone ? `Phone: ${phone}\n` : '';

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phoneHtml}
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  await sendEmail({
    to: contactEmail!,
    subject: `Contact Form: Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n${phoneText}\nMessage:\n${message}`,
    html,
  });
};
