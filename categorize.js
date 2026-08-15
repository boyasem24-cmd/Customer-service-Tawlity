// Lightweight keyword-based pass over a new ticket's subject + first message.
// Not meant to be smart -- just enough to flag likely category/priority so the
// agent can scan the queue instead of opening every ticket. Rule-based on purpose;
// no LLM/external API call here.

const CATEGORY_KEYWORDS = {
  reservation: [
    'reservation', 'booking', 'book a table', 'table for', 'reserve',
    'cancel my booking', 'no confirmation', 'didn\'t confirm', 'waitlist',
  ],
  billing: [
    'refund', 'charged', 'charge', 'payment', 'billing', 'invoice',
    'double charged', 'overcharged', 'card', 'receipt', 'money',
  ],
  app_bug: [
    'crash', 'crashing', 'bug', 'error', 'lagging', 'lag', 'freeze', 'frozen',
    'not working', 'won\'t load', 'wont load', 'blank screen', 'glitch',
  ],
};

const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'asap', 'right now', 'immediately', 'tonight', 'today',
  'emergency', 'angry', 'furious', 'scam', 'fraud', 'unacceptable',
  'legal', 'lawyer', 'cancel my account', 'never again',
];

const LOW_PRIORITY_KEYWORDS = [
  'whenever', 'no rush', 'not urgent', 'just curious', 'small question',
  'minor', 'suggestion', 'feedback',
];

function matchesAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function countMatches(text, keywords) {
  return keywords.reduce((n, kw) => (text.includes(kw) ? n + 1 : n), 0);
}

// Returns { category, priority } for a new ticket. `category` is one of
// 'reservation' | 'app_bug' | 'billing' | 'other'. `priority` is 'high' | 'medium' | 'low'.
function categorizeTicket(subject, message) {
  const text = `${subject || ''} ${message || ''}`.toLowerCase();

  // Score every category by keyword hit count rather than stopping at the first
  // match -- a message can plausibly contain words from more than one category
  // (e.g. "charged twice for the same booking" hits both billing and reservation),
  // and the one with more/stronger matches is the better call.
  let category = 'other';
  let bestScore = 0;
  for (const [name, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = countMatches(text, keywords);
    if (score > bestScore) {
      bestScore = score;
      category = name;
    }
  }

  let priority = 'medium';
  if (matchesAny(text, HIGH_PRIORITY_KEYWORDS)) {
    priority = 'high';
  } else if (matchesAny(text, LOW_PRIORITY_KEYWORDS)) {
    priority = 'low';
  }

  // Billing complaints default to at least medium-high urgency since money is
  // involved, even without an explicit urgency keyword.
  if (category === 'billing' && priority === 'medium') {
    priority = 'high';
  }

  return { category, priority };
}

module.exports = { categorizeTicket };
