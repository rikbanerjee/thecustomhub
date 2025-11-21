// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Go to Email Services and add a service (Gmail, Outlook, etc.)
// 4. Go to Email Templates and create a template
// 5. Go to Integration > API Keys and get your Public Key
// 6. Add the values to your .env file

const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
};

export default emailjsConfig;

