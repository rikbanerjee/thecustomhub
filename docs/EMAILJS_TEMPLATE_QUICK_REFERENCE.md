# EmailJS Template - Quick Reference

## Quick Copy-Paste Template (HTML)

**Subject:**
```
New Contact Form Submission from {{from_name}}
```

**Email Content (HTML):**
```html
<h2 style="color: #4F46E5;">📧 New Contact Form Submission</h2>

<h3>Contact Information</h3>
<p><strong>Name:</strong> {{from_name}}<br>
<strong>Email:</strong> <a href="mailto:{{from_email}}">{{from_email}}</a><br>
<strong>Phone:</strong> {{phone}}</p>

<h3>Order Details</h3>
<p><strong>Order Type:</strong> {{order_type}}<br>
<strong>Quantity:</strong> {{quantity}}<br>
<strong>Event/Occasion:</strong> {{event_name}}<br>
<strong>Product of Interest:</strong> {{product_of_interest}}</p>

<h3>Design Idea</h3>
<p>{{design_idea}}</p>

<h3>Message</h3>
<div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #4F46E5; margin: 10px 0;">
{{message}}
</div>

<hr>
<p><small>Submitted: {{timestamp}}</small><br>
<small>Reply to: <a href="mailto:{{from_email}}">{{from_email}}</a></small></p>
```

**Settings:**
- **To Email:** `personalizedbyrisa@gmail.com`
- **From Name:** `The CustomHub Contact Form`
- **Reply To:** `{{from_email}}`

---

## All Available Variables

Copy these into your template:

```
{{from_name}}          - Customer name
{{from_email}}         - Customer email
{{phone}}              - Phone number
{{order_type}}         - Order type selected
{{quantity}}           - Quantity range
{{event_name}}         - Event/occasion name
{{design_idea}}        - Design idea description
{{product_of_interest}} - Product title
{{message}}            - Main message
{{timestamp}}          - Submission timestamp
```

---

## Setup Checklist

- [ ] Log in to EmailJS dashboard
- [ ] Go to Email Templates → Create New Template
- [ ] Paste the HTML template above
- [ ] Set Subject line
- [ ] Configure To Email, From Name, Reply To
- [ ] Save template
- [ ] Copy Template ID
- [ ] Add to `.env` file as `VITE_EMAILJS_TEMPLATE_ID`
- [ ] Test template with test button
- [ ] Test contact form on website

---

## Need More Details?

See `EMAILJS_TEMPLATE_GUIDE.md` for:
- Detailed step-by-step instructions
- Multiple template options (HTML, Plain Text, Compact)
- Troubleshooting tips
- Advanced formatting options



