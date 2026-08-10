// Thin wrapper around the Meta WhatsApp Cloud API. Only does what this app needs:
// send the "ticket_escalated" template message to the on-call agent's phone.
// See README.md "WhatsApp Cloud API setup" for how to obtain each env var.

function config() {
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    toNumber: process.env.WHATSAPP_TO_NUMBER,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'ticket_escalated',
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US',
    dashboardBaseUrl: process.env.DASHBOARD_BASE_URL || 'http://localhost:3000',
  };
}

function isConfigured() {
  const c = config();
  return Boolean(c.token && c.phoneNumberId && c.toNumber);
}

// Sends the ticket_escalated template. The template body is expected to have
// 4 positional placeholders: {{1}} ticket id, {{2}} subject, {{3}} contact info,
// {{4}} dashboard link. Throws on failure with the actual Graph API error message
// (not just the HTTP status) so the caller can show something actionable.
async function sendEscalationMessage(ticket) {
  const c = config();
  if (!isConfigured()) {
    throw new Error(
      'WhatsApp is not configured: set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ' +
        'and WHATSAPP_TO_NUMBER in .env (see README.md).'
    );
  }

  const dashboardLink = `${c.dashboardBaseUrl}/agent.html?ticket=${ticket.id}`;

  const body = {
    messaging_product: 'whatsapp',
    to: c.toNumber,
    type: 'template',
    template: {
      name: c.templateName,
      language: { code: c.templateLang },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: String(ticket.id) },
            { type: 'text', text: ticket.subject || '(no subject)' },
            { type: 'text', text: ticket.contactInfo || 'unknown' },
            { type: 'text', text: dashboardLink },
          ],
        },
      ],
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
    // Surface the real Graph API error object, not just "400 Bad Request".
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

module.exports = { sendEscalationMessage, isConfigured, config };
