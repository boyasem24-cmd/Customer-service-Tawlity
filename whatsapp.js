// Thin wrapper around the Meta WhatsApp Cloud API. Handles two message types:
// - the "ticket_escalated" template, sent to the on-call agent when a ticket escalates
// - the "ticket_reply_notification" template, sent to the customer when an agent replies
//   (only when the ticket's contact is a phone number; email contacts aren't notified yet)
// See README.md "WhatsApp Cloud API setup" for how to obtain each env var.

function config() {
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    toNumber: process.env.WHATSAPP_TO_NUMBER,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'ticket_escalated',
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US',
    replyTemplateName: process.env.WHATSAPP_REPLY_TEMPLATE_NAME || 'ticket_reply_notification',
    replyTemplateLang: process.env.WHATSAPP_REPLY_TEMPLATE_LANG || 'en_US',
    dashboardBaseUrl: process.env.DASHBOARD_BASE_URL || 'http://localhost:3000',
  };
}

function isConfigured() {
  const c = config();
  return Boolean(c.token && c.phoneNumberId && c.toNumber);
}

// A ticket's contact is only reachable via WhatsApp if it's a phone number.
function canNotifyByWhatsApp(ticket) {
  const c = config();
  return Boolean(c.token && c.phoneNumberId) && ticket.contactType === 'phone' && ticket.contactInfo;
}

// Graph API expects the recipient as digits only (E.164 without the leading +).
function normalizePhone(raw) {
  return String(raw).replace(/[^\d]/g, '');
}

async function sendTemplate({ to, templateName, templateLang, parameters }) {
  const c = config();
  if (!c.token || !c.phoneNumberId) {
    throw new Error(
      'WhatsApp is not configured: set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env (see README.md).'
    );
  }

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLang },
      components: [{ type: 'body', parameters }],
    },
  };

  const url = `https://graph.facebook.com/${c.apiVersion}/${c.phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Surface the real Graph API error object, not just an HTTP status.
    const apiError = json && json.error;
    const detail = apiError
      ? `${apiError.message} (type=${apiError.type}, code=${apiError.code}${
          apiError.error_subcode ? `, subcode=${apiError.error_subcode}` : ''
        }${apiError.error_data ? `, details=${JSON.stringify(apiError.error_data)}` : ''})`
      : JSON.stringify(json);
    const err = new Error(`WhatsApp send failed: ${detail}`);
    err.status = res.status;
    err.graphError = apiError;
    throw err;
  }

  return json;
}

// Sends the ticket_escalated template to the on-call agent. Named placeholders:
// {{ticket_id}}, {{subject}}, {{contact_info}}, {{dashboard_link}}.
async function sendEscalationMessage(ticket) {
  const c = config();
  if (!isConfigured()) {
    throw new Error(
      'WhatsApp is not configured: set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ' +
        'and WHATSAPP_TO_NUMBER in .env (see README.md).'
    );
  }

  const dashboardLink = `${c.dashboardBaseUrl}/agent.html?ticket=${ticket.id}`;

  return sendTemplate({
    to: c.toNumber,
    templateName: c.templateName,
    templateLang: c.templateLang,
    parameters: [
      { type: 'text', parameter_name: 'ticket_id', text: String(ticket.id) },
      { type: 'text', parameter_name: 'subject', text: ticket.subject || '(no subject)' },
      { type: 'text', parameter_name: 'contact_info', text: ticket.contactInfo || 'unknown' },
      { type: 'text', parameter_name: 'dashboard_link', text: dashboardLink },
    ],
  });
}

// Sends the ticket_reply_notification template to the customer when an agent replies.
// Only callable when canNotifyByWhatsApp(ticket) is true. Named placeholders:
// {{ticket_id}}, {{agent_message}}, {{ticket_link}}.
async function sendReplyNotification(ticket, messageText) {
  const c = config();
  const ticketLink = `${c.dashboardBaseUrl}/index.html?ticket=${ticket.id}`;

  return sendTemplate({
    to: normalizePhone(ticket.contactInfo),
    templateName: c.replyTemplateName,
    templateLang: c.replyTemplateLang,
    parameters: [
      { type: 'text', parameter_name: 'ticket_id', text: String(ticket.id) },
      { type: 'text', parameter_name: 'agent_message', text: messageText.slice(0, 500) },
      { type: 'text', parameter_name: 'ticket_link', text: ticketLink },
    ],
  });
}

module.exports = { sendEscalationMessage, sendReplyNotification, canNotifyByWhatsApp, isConfigured, config };
