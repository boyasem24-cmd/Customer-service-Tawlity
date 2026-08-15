require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const { withTable, readTable } = require('./db');
const whatsapp = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const TICKETS_TABLE = 'tickets';

function newId() {
  return crypto.randomBytes(4).toString('hex');
}

function now() {
  return new Date().toISOString();
}

// --- Tickets ---

// Create a new ticket from the widget.
app.post('/api/tickets', async (req, res) => {
  const { subject, message, contactInfo, contactType } = req.body || {};

  if (!subject || !message || !contactInfo) {
    return res.status(400).json({ error: 'subject, message, and contactInfo are required' });
  }

  const ticket = {
    id: newId(),
    subject: String(subject).slice(0, 200),
    contactInfo: String(contactInfo).slice(0, 200),
    contactType: contactType === 'phone' ? 'phone' : 'email',
    status: 'open', // open | escalated | resolved
    createdAt: now(),
    updatedAt: now(),
    escalatedAt: null,
    messages: [
      {
        id: newId(),
        author: 'customer',
        text: String(message).slice(0, 5000),
        createdAt: now(),
      },
    ],
  };

  await withTable(TICKETS_TABLE, (rows) => {
    rows.push(ticket);
  });

  res.status(201).json(ticket);
});

// List tickets for the agent queue, newest first.
app.get('/api/tickets', (req, res) => {
  const rows = readTable(TICKETS_TABLE);
  rows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(rows);
});

// Fetch a single ticket (used by both the widget, to poll for replies, and the agent dashboard).
app.get('/api/tickets/:id', (req, res) => {
  const rows = readTable(TICKETS_TABLE);
  const ticket = rows.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'ticket not found' });
  res.json(ticket);
});

// Append a message. `author` is 'customer' or 'agent'.
app.post('/api/tickets/:id/messages', async (req, res) => {
  const { author, text } = req.body || {};
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (author !== 'customer' && author !== 'agent') {
    return res.status(400).json({ error: "author must be 'customer' or 'agent'" });
  }

  let ticket = null;
  await withTable(TICKETS_TABLE, (rows) => {
    ticket = rows.find((t) => t.id === req.params.id);
    if (!ticket) return;
    ticket.messages.push({
      id: newId(),
      author,
      text: String(text).slice(0, 5000),
      createdAt: now(),
    });
    ticket.updatedAt = now();
  });

  if (!ticket) return res.status(404).json({ error: 'ticket not found' });

  // Let the customer know an agent replied. Best-effort: a notification failure
  // shouldn't undo the reply that was already saved, so it's reported alongside
  // the ticket rather than turning this into an error response.
  let notification = { attempted: false };
  if (author === 'agent') {
    if (whatsapp.canNotifyByWhatsApp(ticket)) {
      notification.attempted = true;
      try {
        await whatsapp.sendReplyNotification(ticket, text);
        notification.sent = true;
      } catch (err) {
        console.error('WhatsApp reply notification failed:', err.message);
        notification.sent = false;
        notification.error = err.message;
      }
    } else if (ticket.contactType === 'email') {
      notification.skippedReason = 'Email notifications are not set up yet.';
    }
  }

  res.status(201).json({ ...ticket, notification });
});

// Escalate a ticket to the on-call agent via WhatsApp.
app.post('/api/tickets/:id/escalate', async (req, res) => {
  let ticket = null;
  const rows = readTable(TICKETS_TABLE);
  ticket = rows.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'ticket not found' });

  try {
    await whatsapp.sendEscalationMessage(ticket);
  } catch (err) {
    console.error('WhatsApp escalation failed:', err.message);
    return res.status(502).json({ error: err.message });
  }

  await withTable(TICKETS_TABLE, (allRows) => {
    const t = allRows.find((row) => row.id === req.params.id);
    if (t) {
      t.status = 'escalated';
      t.escalatedAt = now();
      t.updatedAt = now();
    }
  });

  const updated = readTable(TICKETS_TABLE).find((t) => t.id === req.params.id);
  res.json(updated);
});

// Mark a ticket resolved.
app.post('/api/tickets/:id/resolve', async (req, res) => {
  let ticket = null;
  await withTable(TICKETS_TABLE, (rows) => {
    ticket = rows.find((t) => t.id === req.params.id);
    if (!ticket) return;
    ticket.status = 'resolved';
    ticket.updatedAt = now();
  });
  if (!ticket) return res.status(404).json({ error: 'ticket not found' });
  res.json(ticket);
});

app.listen(PORT, () => {
  console.log(`Tawlity Support listening on http://localhost:${PORT}`);
  console.log(`WhatsApp escalation configured: ${whatsapp.isConfigured()}`);
});
