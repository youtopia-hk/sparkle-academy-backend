import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const msg = {
      to: options.to,
      from: process.env.EMAIL_FROM || 'inquiry.sparkle@gmail.com', // Must be verified sender in SendGrid
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    await sgMail.send(msg);
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
