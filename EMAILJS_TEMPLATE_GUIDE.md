# EmailJS Template Creation Guide

This guide provides ready-to-use EmailJS templates for your contact form.

## Template Variables Available

Your contact form sends these variables to EmailJS:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `{{from_name}}` | Customer's name | "John Doe" |
| `{{from_email}}` | Customer's email | "john@example.com" |
| `{{phone}}` | Phone number | "+1 (508) 733-4489" or "Not provided" |
| `{{order_type}}` | Type of order | "Sports team/event" |
| `{{quantity}}` | Quantity range | "12-24 items (15% off)" or "Not specified" |
| `{{event_name}}` | Event/occasion name | "Taylor Swift KC Concert Squad" or "Not provided" |
| `{{design_idea}}` | Design idea description | "Need help with ideas" or "Not provided" |
| `{{product_of_interest}}` | Product title | "Durga Puja T-Shirt" or "None" |
| `{{message}}` | Main message | Customer's inquiry message |
| `{{timestamp}}` | Submission time | "2025-11-21T00:30:45.123Z" |

---

## Step-by-Step: Create EmailJS Template

### Step 1: Go to Email Templates
1. Log in to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click **Email Templates** in the left sidebar
3. Click **Create New Template**

### Step 2: Configure Template Settings

**Template Name:** `Contact Form - The CustomHub`

**Subject Line:**
```
New Contact Form Submission from {{from_name}}
```

---

## Template Option 1: HTML Email (Recommended)

**Use this for:** Professional, formatted emails with better readability

**Paste this in the Email Content field:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #4F46E5; display: inline-block; min-width: 150px; }
    .value { color: #1f2937; }
    .message-box { background-color: white; padding: 15px; border-left: 4px solid #4F46E5; margin-top: 20px; }
    .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px;">The CustomHub Contact Form</p>
    </div>
    
    <div class="content">
      <h3 style="color: #4F46E5; margin-top: 0;">Contact Information</h3>
      
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">{{from_name}}</span>
      </div>
      
      <div class="field">
        <span class="label">Email:</span>
        <span class="value"><a href="mailto:{{from_email}}">{{from_email}}</a></span>
      </div>
      
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">{{phone}}</span>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="color: #4F46E5;">Order Details</h3>
      
      <div class="field">
        <span class="label">Order Type:</span>
        <span class="value">{{order_type}}</span>
      </div>
      
      <div class="field">
        <span class="label">Quantity:</span>
        <span class="value">{{quantity}}</span>
      </div>
      
      <div class="field">
        <span class="label">Event/Occasion:</span>
        <span class="value">{{event_name}}</span>
      </div>
      
      <div class="field">
        <span class="label">Product of Interest:</span>
        <span class="value">{{product_of_interest}}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="field">
        <span class="label">Design Idea:</span>
        <div class="value" style="margin-top: 5px;">{{design_idea}}</div>
      </div>
      
      <div class="message-box">
        <strong style="color: #4F46E5;">Message:</strong>
        <p style="margin: 10px 0 0 0; white-space: pre-wrap;">{{message}}</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="field" style="font-size: 12px; color: #6b7280;">
        <span class="label">Submitted:</span>
        <span class="value">{{timestamp}}</span>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">This email was sent from The CustomHub contact form.</p>
      <p style="margin: 5px 0 0 0;">Reply directly to: <a href="mailto:{{from_email}}">{{from_email}}</a></p>
    </div>
  </div>
</body>
</html>
```

---

## Template Option 2: Plain Text Email

**Use this for:** Simple, universal compatibility

**Paste this in the Email Content field:**

```
📧 NEW CONTACT FORM SUBMISSION
The CustomHub Contact Form
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Type: {{order_type}}
Quantity: {{quantity}}
Event/Occasion: {{event_name}}
Product of Interest: {{product_of_interest}}

DESIGN IDEA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{design_idea}}

MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: {{timestamp}}

Reply directly to: {{from_email}}
```

---

## Template Option 3: Compact HTML (Minimal Styling)

**Use this for:** Quick setup with basic formatting

```html
<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> {{from_name}} ({{from_email}})</p>
<p><strong>Phone:</strong> {{phone}}</p>

<h3>Order Details</h3>
<ul>
  <li><strong>Order Type:</strong> {{order_type}}</li>
  <li><strong>Quantity:</strong> {{quantity}}</li>
  <li><strong>Event/Occasion:</strong> {{event_name}}</li>
  <li><strong>Product of Interest:</strong> {{product_of_interest}}</li>
</ul>

<h3>Design Idea</h3>
<p>{{design_idea}}</p>

<h3>Message</h3>
<p>{{message}}</p>

<hr>
<p><small>Submitted: {{timestamp}}</small></p>
<p><small>Reply to: {{from_email}}</small></p>
```

---

## Step 3: Configure Email Settings

After pasting your template:

1. **To Email:** Enter your business email (e.g., `personalizedbyrisa@gmail.com`)
2. **From Name:** `The CustomHub Contact Form`
3. **Reply To:** `{{from_email}}` (This allows you to reply directly to the customer)
4. **Subject:** `New Contact Form Submission from {{from_name}}`

---

## Step 4: Test Your Template

1. Click **Save** to save your template
2. Click **Test** button in EmailJS dashboard
3. Fill in test values for each variable
4. Send a test email to verify formatting

**Test Values:**
```
from_name: John Doe
from_email: john@example.com
phone: +1 (508) 733-4489
order_type: Sports team/event
quantity: 12-24 items (15% off)
event_name: Taylor Swift KC Concert Squad
design_idea: Need help with ideas
product_of_interest: Durga Puja T-Shirt
message: I'm interested in ordering custom t-shirts for my group.
timestamp: 2025-11-21T00:30:45.123Z
```

---

## Step 5: Get Your Template ID

1. After saving, you'll see your template in the list
2. Click on your template name
3. **Copy the Template ID** (looks like: `template_xxxxxxxxx`)
4. Add it to your `.env` file as `VITE_EMAILJS_TEMPLATE_ID`

---

## Pro Tips

### 1. Reply-To Configuration
Make sure to set **Reply To** as `{{from_email}}` so you can reply directly to customers.

### 2. Conditional Display (Advanced)
If you want to hide fields when they're "Not provided", you can use EmailJS's conditional syntax:
```html
{{#if_neq event_name "Not provided"}}
  <p><strong>Event:</strong> {{event_name}}</p>
{{/if_neq}}
```

### 3. Format Timestamp
To format the timestamp in a more readable way, you can use:
```html
{{timestamp}} <!-- ISO format -->
```
Note: EmailJS doesn't have built-in date formatting, but the ISO format is readable.

### 4. Email Service Setup
Make sure your email service (Gmail, Outlook, etc.) is properly connected:
- Go to **Email Services** in EmailJS
- Verify your service shows as "Connected"
- Test sending an email from the service page

---

## Troubleshooting

### Template Variables Not Showing
- Make sure variable names match exactly (case-sensitive)
- Use double curly braces: `{{variable_name}}`
- Check for typos in variable names

### Email Not Received
- Check spam/junk folder
- Verify email service is connected
- Check EmailJS dashboard for error logs
- Test template with EmailJS's test feature

### Formatting Issues
- HTML emails may render differently in different email clients
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Use inline CSS for better compatibility

---

## Next Steps

1. ✅ Create your template using one of the options above
2. ✅ Copy your Template ID
3. ✅ Add it to your `.env` file
4. ✅ Test the contact form on your website
5. ✅ Verify emails are received correctly

Your contact form is ready to send professional emails! 🎉



