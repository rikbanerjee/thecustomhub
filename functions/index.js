/* eslint-disable */
/**
 * Firebase Cloud Functions — TheCustomHub
 *
 * ─── Required Secrets (Firebase Secret Manager) ───────────────────────────
 *   STRIPE_SECRET_KEY      — already set
 *     firebase functions:secrets:set STRIPE_SECRET_KEY
 *
 *   STRIPE_WEBHOOK_SECRET  — new; set BEFORE deploying stripeWebhook
 *     firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
 *     (paste the whsec_... Signing secret from the Stripe webhook endpoint)
 *
 *   RESEND_API_KEY         — new
 *     firebase functions:secrets:set RESEND_API_KEY
 *     (paste your Resend API key from resend.com/api-keys)
 *
 *   RESEND_WEBHOOK_SECRET  — new; set BEFORE deploying resendInboundWebhook
 *     firebase functions:secrets:set RESEND_WEBHOOK_SECRET
 *     (paste the whsec_... Signing secret from the Resend webhook endpoint
 *      configured for the email.received event)
 *
 * After setting new secrets: firebase deploy --only functions
 * ─────────────────────────────────────────────────────────────────────────
 */

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const Stripe = require("stripe");
const { Resend } = require("resend");
const { Webhook } = require("svix");

initializeApp();

// Track B3/B4 — RetailAgentOS discovery endpoints (ucpManifest, productSchema).
Object.assign(exports, require("./raos"));

// ─── Secrets ──────────────────────────────────────────────────────────────────
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const resendApiKey = defineSecret("RESEND_API_KEY");
const resendWebhookSecret = defineSecret("RESEND_WEBHOOK_SECRET");

// Where inbound mail to *@thecustomhub.com gets forwarded.
const FORWARD_TO = "personalizedbyrisa@gmail.com";
// Must be an address on a Resend-verified sending domain (thecustomhub.com).
const FORWARD_FROM = "The CustomHub Mail <forward@thecustomhub.com>";

// ─── sendOrderEmail (internal helper) ────────────────────────────────────────
/**
 * Sends an HTML order notification to the store owner via Resend.
 *
 * @param {object} orderData
 * @param {string} apiKey  Resend API key value
 */
async function sendOrderEmail(orderData, apiKey) {
  const resend = new Resend(apiKey);

  const {
    source,
    status,
    stripeSessionId,
    customerEmail,
    shippingAddress,
    items = [],
    subtotal,
    amountTotal,
  } = orderData;

  const etTimestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const itemsRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ede9;">
            ${item.title}${
          item.variantLabel
            ? ` <span style="color:#9caf88;font-size:12px;">(${item.variantLabel})</span>`
            : ""
        }
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ede9;text-align:center;">${
            item.quantity
          }</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ede9;text-align:right;">$${(
            Number(item.price) * Number(item.quantity)
          ).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const totalDisplay =
    amountTotal != null
      ? `$${Number(amountTotal).toFixed(2)}`
      : subtotal != null
      ? `$${Number(subtotal).toFixed(2)}`
      : "See dashboard";

  const sourceLabel = source === "stripe" ? "Online (Stripe)" : "WhatsApp Lead";
  const statusBadge =
    status === "paid"
      ? `<span style="background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">PAID</span>`
      : `<span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">LEAD</span>`;

  const sessionBlock =
    stripeSessionId
      ? `<tr>
          <td style="padding-bottom:16px;">
            <p style="margin:0;font-size:13px;color:#6b7280;">
              Stripe Session:
              <span style="font-family:monospace;color:#2c1810;">${stripeSessionId}</span>
            </p>
            ${
              customerEmail
                ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">
                     Customer Email:
                     <a href="mailto:${customerEmail}" style="color:#c9a67c;">${customerEmail}</a>
                   </p>`
                : ""
            }
          </td>
        </tr>`
      : "";

  const shippingBlock = shippingAddress
    ? `<tr>
        <td style="padding-bottom:16px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#2c1810;">Ship to:</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            ${shippingAddress.name ? `${shippingAddress.name}<br>` : ""}
            ${shippingAddress.line1 || ""}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br>
            ${shippingAddress.city || ""}${shippingAddress.state ? `, ${shippingAddress.state}` : ""} ${shippingAddress.postalCode || ""}<br>
            ${shippingAddress.country || ""}
          </p>
        </td>
      </tr>`
    : `<tr>
        <td style="padding-bottom:16px;">
          <p style="margin:0;font-size:13px;color:#b45309;">No shipping address on file for this order.</p>
        </td>
      </tr>`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>New Order — The CustomHub</title></head>
<body style="margin:0;padding:0;font-family:'Work Sans',Arial,sans-serif;background:#f7f5f2;color:#2c1810;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(44,24,16,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#2c1810;padding:24px 32px;">
            <h1 style="margin:0;color:#c9a67c;font-size:22px;font-weight:700;letter-spacing:0.5px;">
              The CustomHub
            </h1>
            <p style="margin:4px 0 0;color:#e8d5b7;font-size:13px;">New Order Notification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <!-- Title + badge -->
              <tr>
                <td style="padding-bottom:20px;">
                  <h2 style="margin:0 0 6px;font-size:18px;">
                    New Order Received &nbsp;${statusBadge}
                  </h2>
                  <p style="margin:0;color:#6b7280;font-size:13px;">
                    ${etTimestamp} ET &nbsp;·&nbsp; Source: ${sourceLabel}
                  </p>
                </td>
              </tr>

              ${sessionBlock}

              ${shippingBlock}

              <!-- Items table -->
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="border:1px solid #f0ede9;border-radius:8px;overflow:hidden;font-size:14px;">
                    <thead>
                      <tr style="background:#faf8f6;">
                        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:600;">Item</th>
                        <th style="padding:10px 12px;text-align:center;color:#6b7280;font-weight:600;">Qty</th>
                        <th style="padding:10px 12px;text-align:right;color:#6b7280;font-weight:600;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>${itemsRows}</tbody>
                    <tfoot>
                      <tr style="background:#faf8f6;">
                        <td colspan="2"
                          style="padding:12px;font-weight:700;text-align:right;font-size:15px;">
                          Total
                        </td>
                        <td style="padding:12px;font-weight:700;text-align:right;font-size:15px;color:#2c1810;">
                          ${totalDisplay}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#faf8f6;padding:16px 32px;border-top:1px solid #f0ede9;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Sent automatically by TheCustomHub order system.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // TODO: Replace 'onboarding@resend.dev' with 'orders@thecustomhub.com' once the
  // domain is verified in your Resend dashboard at resend.com/domains.
  await resend.emails.send({
    from: "The CustomHub Orders <onboarding@resend.dev>",
    to: "personalizedbyrisa@gmail.com",
    subject: `[TheCustomHub] New ${
      status === "paid" ? "Order" : "Lead"
    } — ${sourceLabel} — ${totalDisplay}`,
    html,
  });
}

// ─── sendInquiryEmail (internal helper) ──────────────────────────────────────
/**
 * Builds and sends a customer inquiry notification to the store owner via
 * Resend. Handles all non-order lead forms (contact, custom order stepper,
 * homepage quick-lead form, newsletter signup) with one shared template so
 * there's a single place to maintain email formatting/branding.
 *
 * @param {object} data  See exports.sendInquiryEmail for the expected shape per `type`.
 * @param {string} apiKey  Resend API key value
 */
async function sendInquiryEmail(data, apiKey) {
  const resend = new Resend(apiKey);

  const TYPE_LABELS = {
    contact: 'Contact Form Submission',
    'custom-order': 'Custom Order Request',
    'quick-lead': 'Quick Custom Order Lead',
    newsletter: 'Newsletter Signup',
  };
  const title = TYPE_LABELS[data.type] || 'New Website Inquiry';

  const etTimestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Ordered [label, value] rows per inquiry type — keeps the HTML builder
  // generic instead of writing four near-identical templates.
  let rows = [];
  switch (data.type) {
    case 'contact':
      rows = [
        ['Name', data.name],
        ['Email', data.email],
        ['Phone', data.phone || 'Not provided'],
        ['Order Type', data.orderType || 'Not specified'],
        ['Quantity', data.quantity || 'Not specified'],
        ['Event', data.eventName || 'Not provided'],
        ['Design Idea', data.designIdea || 'Not provided'],
        ['Product of Interest', data.productOfInterest || 'None'],
        ['Message', data.message],
      ];
      break;
    case 'custom-order':
      rows = [
        ['Name', data.name],
        ['Email', data.email],
        ['Product', data.orderType],
        ['Color', data.color || 'N/A'],
        ['Total Quantity', data.quantity],
        ['Size Breakdown', data.sizesBreakdown || 'N/A'],
        ['Placement', data.placement || 'N/A'],
        ['Design (Front)', data.designFrontUrl || 'Not uploaded'],
        ['Design (Back)', data.designBackUrl || 'Not uploaded'],
        ['Notes', data.notes || 'None provided'],
      ];
      break;
    case 'quick-lead':
      rows = [
        ['Name', data.name],
        ['Email', data.email],
        ['Product', data.orderType],
        ['Quantity', data.quantity],
        ['Idea', data.idea || 'No details provided yet'],
      ];
      break;
    case 'newsletter':
      rows = [['Subscriber Email', data.email]];
      break;
    default:
      throw new Error(`Unknown inquiry type: ${data.type}`);
  }

  const rowsHtml = rows
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([label, value]) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ede9;font-weight:600;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ede9;font-size:14px;color:#2c1810;">${String(
          value
        ).replace(/\n/g, '<br>')}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${title} — The CustomHub</title></head>
<body style="margin:0;padding:0;font-family:'Work Sans',Arial,sans-serif;background:#f7f5f2;color:#2c1810;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(44,24,16,0.08);">
        <tr>
          <td style="background:#2c1810;padding:24px 32px;">
            <h1 style="margin:0;color:#c9a67c;font-size:22px;font-weight:700;letter-spacing:0.5px;">
              The CustomHub
            </h1>
            <p style="margin:4px 0 0;color:#e8d5b7;font-size:13px;">${title}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">${etTimestamp} ET</p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #f0ede9;border-radius:8px;overflow:hidden;">
              <tbody>${rowsHtml}</tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#faf8f6;padding:16px 32px;border-top:1px solid #f0ede9;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Sent automatically by TheCustomHub website.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // TODO: Replace 'onboarding@resend.dev' with 'orders@thecustomhub.com' once the
  // domain is verified in your Resend dashboard at resend.com/domains.
  await resend.emails.send({
    from: 'The CustomHub <onboarding@resend.dev>',
    to: 'personalizedbyrisa@gmail.com',
    ...(data.email ? { reply_to: data.email } : {}),
    subject: `[TheCustomHub] ${title}${data.name ? ` — ${data.name}` : ''}`,
    html,
  });
}

// ─── sendInquiryEmail (callable) ──────────────────────────────────────────────
/**
 * Callable function — replaces EmailJS as the single email-sending path for
 * every lead form on the site (Contact, /custom-orders stepper, homepage
 * quick-lead form, newsletter signup). Keeping the Resend API key server-side
 * (Secret Manager) instead of a public key shipped in the client bundle.
 *
 * Called from the frontend as:
 *   const fn = httpsCallable(firebaseFunctions, 'sendInquiryEmail');
 *   await fn({ type: 'contact' | 'custom-order' | 'quick-lead' | 'newsletter', ...fields });
 */
exports.sendInquiryEmail = onCall(
  { secrets: [resendApiKey] },
  async (request) => {
    const data = request.data || {};

    if (!data.type) {
      throw new HttpsError('invalid-argument', 'type is required.');
    }
    if (data.type !== 'newsletter' && (!data.name || !data.email)) {
      throw new HttpsError('invalid-argument', 'name and email are required.');
    }
    if (data.type === 'newsletter' && !data.email) {
      throw new HttpsError('invalid-argument', 'email is required.');
    }

    try {
      await sendInquiryEmail(data, resendApiKey.value());
    } catch (err) {
      console.error(`sendInquiryEmail (${data.type}) failed:`, err);
      throw new HttpsError('internal', 'Failed to send email.');
    }

    return { success: true };
  }
);

// ─── createCheckoutSession ────────────────────────────────────────────────────
exports.createCheckoutSession = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    const secretKey = stripeSecretKey.value();

    if (!secretKey) {
      throw new HttpsError(
        "failed-precondition",
        "Stripe secret key is not configured. Run: firebase functions:secrets:set STRIPE_SECRET_KEY"
      );
    }

    const { items } = request.data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Cart items array is required and must not be empty."
      );
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      success_url:
        "https://thecustomhub.com/order-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://thecustomhub.com/cart",
      ...(request.data.customerEmail
        ? { customer_email: request.data.customerEmail }
        : {}),
      metadata: { source: "thecustomhub-web" },
    });

    return { url: session.url };
  }
);

// ─── stripeWebhook ────────────────────────────────────────────────────────────
/**
 * HTTP function — receives Stripe webhook events and persists paid orders to
 * Firestore, then emails the owner.
 *
 * One-time setup:
 *   1. Deploy this function:
 *        firebase deploy --only functions:stripeWebhook
 *   2. Note the function URL printed after deploy — it looks like:
 *        https://<region>-thecustomhub-efb8a.cloudfunctions.net/stripeWebhook
 *   3. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *        URL: <function URL from step 2>
 *        Event to listen to: checkout.session.completed
 *   4. After saving, reveal the Signing secret (whsec_...) and run:
 *        firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
 *      Paste the whsec_... value when prompted, then redeploy.
 */
exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret, resendApiKey] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const sig = req.headers["stripe-signature"];
    const webhookSig = stripeWebhookSecret.value();

    if (!webhookSig) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured.");
      res.status(500).send("Webhook secret not configured.");
      return;
    }

    let event;
    try {
      const stripe = new Stripe(stripeSecretKey.value(), {
        apiVersion: "2024-06-20",
      });
      // Firebase Functions v2 exposes the raw request body on request.rawBody —
      // required for Stripe's HMAC signature verification.
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSig);
    } catch (err) {
      console.error("Stripe signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Retrieve the full session with line_items expanded (not included by default)
      const stripe = new Stripe(stripeSecretKey.value(), {
        apiVersion: "2024-06-20",
      });
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });

      const items = (fullSession.line_items?.data || []).map((li) => ({
        title: li.description || "Item",
        quantity: li.quantity,
        price:
          li.quantity > 0
            ? li.amount_total / 100 / li.quantity
            : li.amount_total / 100,
        variantLabel: null,
      }));

      const amountTotal = fullSession.amount_total / 100;

      // Populated by Stripe once shipping_address_collection is set on the
      // Checkout Session (see createCheckoutSession) — without that param
      // this is always null, so there's nowhere to ship the order to.
      const shippingDetails = fullSession.shipping_details || null;
      const shippingAddress = shippingDetails?.address
        ? {
            name: shippingDetails.name || null,
            line1: shippingDetails.address.line1 || null,
            line2: shippingDetails.address.line2 || null,
            city: shippingDetails.address.city || null,
            state: shippingDetails.address.state || null,
            postalCode: shippingDetails.address.postal_code || null,
            country: shippingDetails.address.country || null,
          }
        : null;

      const orderDoc = {
        source: "stripe",
        status: "paid",
        stripeSessionId: fullSession.id,
        // customer_email is only populated when we pre-set it on the session;
        // for Stripe-hosted Checkout the address the customer actually typed
        // lands in customer_details.email, so fall back to that.
        customerEmail:
          fullSession.customer_email ||
          fullSession.customer_details?.email ||
          null,
        shippingAddress,
        items,
        subtotal: amountTotal,
        currency: fullSession.currency || "usd",
        amountTotal,
        createdAt: FieldValue.serverTimestamp(),
        emailNotified: false,
      };

      const db = getFirestore();
      const docRef = db.collection("orders").doc(fullSession.id);

      try {
        // merge: true is idempotent — safe if Stripe retries the webhook
        await docRef.set(orderDoc, { merge: true });
      } catch (err) {
        console.error("Failed to write Stripe order to Firestore:", err);
        res.status(500).send("Database write failed.");
        return;
      }

      let emailNotified = false;
      try {
        await sendOrderEmail(orderDoc, resendApiKey.value());
        emailNotified = true;
      } catch (err) {
        console.error("Order notification email failed:", err);
        // Do not return 500 — the order is saved; email failure should not
        // trigger a Stripe retry (which would create duplicate Firestore docs).
      }

      await docRef.update({ emailNotified }).catch((e) =>
        console.error("Failed to update emailNotified flag:", e)
      );
    }

    // Always respond 200 so Stripe does not retry non-critical events.
    res.status(200).json({ received: true });
  }
);

// ─── saveWhatsAppLead ─────────────────────────────────────────────────────────
/**
 * Callable function — captures a WhatsApp order lead from the frontend before
 * the customer opens WhatsApp. Saves a Firestore doc and emails the owner.
 *
 * Called from CartContext.captureWhatsAppLead() with { items, subtotal }.
 */
exports.saveWhatsAppLead = onCall(
  { secrets: [resendApiKey] },
  async (request) => {
    const { items, subtotal } = request.data;

    if (!items || !Array.isArray(items)) {
      throw new HttpsError("invalid-argument", "items must be an array.");
    }

    const orderDoc = {
      source: "whatsapp",
      status: "lead",
      stripeSessionId: null,
      customerEmail: null,
      items,
      subtotal: subtotal || 0,
      currency: "usd",
      amountTotal: null,
      createdAt: FieldValue.serverTimestamp(),
      emailNotified: false,
    };

    const db = getFirestore();
    const docRef = await db.collection("orders").add(orderDoc);

    let emailNotified = false;
    try {
      await sendOrderEmail(orderDoc, resendApiKey.value());
      emailNotified = true;
    } catch (err) {
      console.error("WhatsApp lead notification email failed:", err);
      // Swallow — the lead is saved even if the email fails.
    }

    await docRef.update({ emailNotified }).catch((e) =>
      console.error("Failed to update emailNotified flag:", e)
    );

    return { success: true };
  }
);

// ─── resendInboundWebhook ─────────────────────────────────────────────────────
/**
 * HTTP function — receives Resend inbound-email webhooks and forwards any mail
 * sent to *@thecustomhub.com on to the owner's Gmail (FORWARD_TO).
 *
 * Setup:
 *   1) In Resend, verify thecustomhub.com for RECEIVING (add the MX records) so
 *      mail to *@thecustomhub.com lands in Resend.
 *   2) Resend → Webhooks → Add endpoint:
 *        URL:   https://us-central1-thecustomhub-efb8a.cloudfunctions.net/resendInboundWebhook
 *        Event: email.received
 *   3) Copy that endpoint's Signing secret (whsec_...) and set it:
 *        firebase functions:secrets:set RESEND_WEBHOOK_SECRET
 *   4) firebase deploy --only functions:resendInboundWebhook
 *
 * The email.received payload carries metadata only (no body), so we verify the
 * Svix signature, then fetch the full message from the Received Emails API and
 * re-send it via Resend. reply_to is set to the original sender so replies from
 * Gmail reach the real person.
 */
exports.resendInboundWebhook = onRequest(
  { secrets: [resendApiKey, resendWebhookSecret] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signingSecret = resendWebhookSecret.value();
    if (!signingSecret) {
      console.error("RESEND_WEBHOOK_SECRET is not configured.");
      res.status(500).send("Webhook secret not configured.");
      return;
    }

    // Svix signature verification — req.rawBody is the exact bytes Resend signed.
    let event;
    try {
      const wh = new Webhook(signingSecret);
      event = wh.verify(req.rawBody, {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      });
    } catch (err) {
      console.error("Resend webhook signature verification failed:", err.message);
      res.status(400).send("Invalid signature");
      return;
    }

    // Only inbound mail is actionable; ack everything else so Resend won't retry.
    if (event.type !== "email.received") {
      res.status(200).json({ received: true, ignored: event.type });
      return;
    }

    const emailId = event.data?.email_id;
    if (!emailId) {
      console.error("email.received event missing email_id");
      res.status(200).json({ received: true });
      return;
    }

    try {
      // The webhook has metadata only — fetch the full message (body + headers).
      const apiKey = resendApiKey.value();
      const resp = await fetch(
        `https://api.resend.com/emails/receiving/${emailId}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      if (!resp.ok) {
        const body = await resp.text();
        console.error(
          `Failed to fetch received email ${emailId}: ${resp.status} ${body}`
        );
        // 200 so Resend doesn't hammer retries on a fetch that keeps failing.
        res.status(200).json({ received: true, fetched: false });
        return;
      }
      const mail = await resp.json();

      const originalFrom = mail.from || "unknown sender";
      const receivedFor =
        (Array.isArray(mail.received_for) && mail.received_for.join(", ")) ||
        (Array.isArray(event.data.received_for) &&
          event.data.received_for.join(", ")) ||
        (Array.isArray(mail.to) && mail.to.join(", ")) ||
        "your domain";
      const subject = mail.subject || "(no subject)";
      const attachments = mail.attachments || [];
      const attachmentNote =
        attachments.length > 0
          ? `<p style="margin:0 0 4px;color:#b45309;font-size:13px;">` +
            `📎 ${attachments.length} attachment(s) not forwarded — view in Resend: ` +
            attachments.map((a) => a.filename || "file").join(", ") +
            `</p>`
          : "";

      const header =
        `<div style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;` +
        `border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:16px;">` +
        `<p style="margin:0 0 4px;"><strong>From:</strong> ${originalFrom}</p>` +
        `<p style="margin:0 0 4px;"><strong>To:</strong> ${receivedFor}</p>` +
        `<p style="margin:0 0 4px;"><strong>Subject:</strong> ${subject}</p>` +
        attachmentNote +
        `<p style="margin:8px 0 0;color:#9ca3af;">Forwarded automatically from thecustomhub.com</p>` +
        `</div>`;

      const bodyHtml =
        mail.html ||
        (mail.text
          ? `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${mail.text}</pre>`
          : "<p>(empty message)</p>");

      const resend = new Resend(apiKey);
      const forward = await resend.emails.send({
        from: FORWARD_FROM,
        to: FORWARD_TO,
        reply_to: originalFrom,
        subject: `[${receivedFor}] ${subject}`,
        html: header + bodyHtml,
        text: mail.text || undefined,
      });

      if (forward.error) {
        console.error("Forward send failed:", forward.error);
        res.status(200).json({ received: true, forwarded: false });
        return;
      }

      console.log(
        `Forwarded inbound email ${emailId} (to ${receivedFor}) → ${FORWARD_TO}`
      );
      res.status(200).json({ received: true, forwarded: true });
    } catch (err) {
      console.error("Inbound forward failed:", err);
      // 200 to avoid retry storms; the failure is logged for inspection.
      res.status(200).json({ received: true, forwarded: false });
    }
  }
);
