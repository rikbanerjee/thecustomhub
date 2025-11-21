# EmailJS Setup Guide

This guide will help you set up EmailJS for the contact form to send emails.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails/month)

## Step 2: Add Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. **Copy the Service ID** - you'll need this later

## Step 3: Create Email Template

1. Go to **Email Templates** in the EmailJS dashboard
2. Click **Create New Template**
3. Use the following template variables in your email template:

```
Subject: Contact Form Submission from {{from_name}}

From: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Order Type: {{order_type}}
Quantity: {{quantity}}
Event Name: {{event_name}}
Design Idea: {{design_idea}}
Product of Interest: {{product_of_interest}}
Message: {{message}}
Timestamp: {{timestamp}}
```

4. **Copy the Template ID** - you'll need this later

## Step 4: Get Public Key

1. Go to **Integration** > **API Keys** in the EmailJS dashboard
2. **Copy the Public Key** - you'll need this later

## Step 5: Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

3. Replace the placeholder values with your actual values from EmailJS

## Step 6: Test the Contact Form

1. Start your development server: `npm run dev`
2. Navigate to the contact page
3. Fill out and submit the form
4. Check your email inbox for the submission

## Troubleshooting

### Error: "EmailJS is not configured"
- Make sure you've created a `.env` file with all three required variables
- Restart your development server after adding environment variables
- Check that variable names start with `VITE_` (required for Vite)

### Email not received
- Check your EmailJS dashboard for error logs
- Verify your email service is properly connected
- Check spam/junk folder
- Ensure your email template variables match the ones in the code

### Template Variables Reference

The contact form sends the following variables to EmailJS:

- `from_name` - User's name
- `from_email` - User's email address
- `phone` - User's phone number (or "Not provided")
- `order_type` - Type of order selected
- `quantity` - Quantity selected (or "Not specified")
- `event_name` - Event/occasion name (or "Not provided")
- `design_idea` - Design idea description (or "Not provided")
- `product_of_interest` - Product title (or "None")
- `message` - Main message from user
- `timestamp` - ISO timestamp of submission

## Production Deployment

For production deployment, make sure to:
1. Add the same environment variables to your hosting platform (Firebase, Vercel, Netlify, etc.)
2. Restart/redeploy your application after adding environment variables
3. Test the contact form in production

## Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- Basic email templates
- Gmail, Outlook, and other popular providers

For higher volume, consider upgrading to a paid plan.

