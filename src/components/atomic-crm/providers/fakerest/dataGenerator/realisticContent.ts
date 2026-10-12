/**
 * Realistic (fictional) texts for the demo data: what a Tawlity sales or
 * account manager would actually write in the CRM. Placeholders:
 * {first} contact first name, {restaurant} restaurant name, {area} area,
 * {fee} monthly fee, {branches} number of branches.
 */

export const fill = (
  template: string,
  values: Record<string, string | number | null | undefined>,
) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

/** Contact notes by the restaurant's account status, with the note status they set. */
export const contactNotesByAccountStatus: Record<
  string,
  { text: string; status: string }[]
> = {
  prospect: [
    {
      text: "Walked in during lunch at {restaurant} ({area}). Spoke to {first} for 10 minutes; they take bookings by phone and Instagram DMs and lose track on Thursday nights. Left a flyer and promised a demo.",
      status: "cold",
    },
    {
      text: "{first} replied on WhatsApp: interested but busy until after the weekend. Asked for pricing in writing. Sent the Starter / Pro comparison PDF.",
      status: "warm",
    },
    {
      text: "Demo done on the iPad. {first} liked the waitlist SMS and the table map. Main concern: staff adoption, the hosts are not tech-savvy. Offered a free on-site training session.",
      status: "warm",
    },
    {
      text: "{first} wants to see how the no-show protection works before committing. Shared two references (Bait Al Najdi, Beirut Corner). Follow up Sunday.",
      status: "hot",
    },
    {
      text: "Price objection: {first} compared us with Eat App. Explained we include the diner app listing and WhatsApp reminders at no extra cost. They will discuss with the partner.",
      status: "warm",
    },
    {
      text: "Met {first} at the Kuwait Gastronomy Association evening. They are opening a second branch in {area} in two months and want a booking system ready before launch.",
      status: "hot",
    },
    {
      text: "No answer to calls or WhatsApp for two weeks. {first} is probably travelling. Parking this until next month.",
      status: "cold",
    },
  ],
  onboarding: [
    {
      text: "Contract signed by {first}. Kick-off scheduled: menu photos to collect, floor plan to configure ({branches} branch(es)).",
      status: "in-contract",
    },
    {
      text: "Received the menu and 24 photos from {first}. Uploaded everything, waiting for their approval of the restaurant page.",
      status: "in-contract",
    },
    {
      text: "Training session with the hosts went well. {first} asked for an Arabic version of the quick guide; sent it the same day.",
      status: "in-contract",
    },
    {
      text: "Tables configured, but they want to merge tables 4 and 5 for groups on weekends. Showed {first} how to create table combinations.",
      status: "in-contract",
    },
  ],
  live: [
    {
      text: "Monthly check-in with {first}: 410 bookings through Tawlity this month, no-show rate down from 18% to 7% since WhatsApp reminders were turned on.",
      status: "in-contract",
    },
    {
      text: "{first} asked whether we can add a deposit for groups of 8+ during Ramadan iftar. Logged as a feature request, will confirm timing.",
      status: "in-contract",
    },
    {
      text: "Sent the monthly report. {first} shared it with the owner, who wants a meeting about adding their new branch to the plan.",
      status: "hot",
    },
    {
      text: "Complaint from {first}: the waitlist screen froze twice on Friday night. Support fixed it (app update on the host iPad). Follow up next Friday to make sure it is stable.",
      status: "warm",
    },
    {
      text: "{restaurant} is now our top-rated listing in {area}. {first} agreed to be a reference for new prospects.",
      status: "in-contract",
    },
  ],
  paused: [
    {
      text: "{first} paused the account for the summer renovation. Plan to restart in September; keep the menu and floor plan as they are.",
      status: "cold",
    },
    {
      text: "Called {first} to check the reopening date. Works are late, now expected in 6 weeks.",
      status: "warm",
    },
  ],
  churned: [
    {
      text: "{first} cancelled: walk-in traffic is enough for them and they did not use the waitlist. Left on good terms, re-approach in 6 months.",
      status: "cold",
    },
    {
      text: "Exit call with {first}: the main reason was price for a single small branch. Could come back on a lighter plan.",
      status: "cold",
    },
  ],
};

/** Contact background ("how we met") lines. */
export const contactBackgrounds = [
  "Met during a door-to-door visit in {area}.",
  "Introduced by the owner of a restaurant already on Tawlity.",
  "Came to our stand at the Kuwait Food Expo.",
  "Member of the Kuwait Gastronomy Association; met at their monthly dinner.",
  "Filled in the contact form on tawlity.co after seeing our Instagram ad.",
  "Prefers WhatsApp to calls. Best reached after 4 pm, before dinner service.",
  "Decides with the managing partner; always copy both on proposals.",
];

/** Restaurant descriptions. */
export const restaurantDescriptions = [
  "Busy at weekends with a waiting line on Thursday and Friday nights. Takes bookings by phone today.",
  "Family restaurant, large groups during Ramadan and Eid. Interested in deposits for big tables.",
  "Popular with office workers at lunch; dinner is quieter. Wants to fill weekday evenings.",
  "Instagram-driven brand with a young crowd. Lots of last-minute bookings through DMs.",
  "Fine-dining spot with a strong corporate clientele. No-shows are their main pain point.",
  "Seafront location, terrace seating in winter. Waitlist is the key feature for them.",
];

/** Pipeline deal descriptions by stage. */
export const dealDescriptions: Record<string, string> = {
  lead: "First contact made. Need to visit the restaurant and meet the decision maker.",
  visited:
    "Visited the restaurant, met the manager. Demo to schedule with the owner present.",
  "demo-done":
    "Demo done. They liked the waitlist and WhatsApp reminders; waiting for their feedback on the price.",
  trial:
    "On a 30-day free trial. Check usage weekly and push for the first live bookings.",
  negotiation:
    "Negotiating the monthly fee for all branches. Owner asked for a discount on a 12-month commitment.",
  signed:
    "Contract signed. Onboarding to start: menu, photos, floor plan and staff training.",
  live: "Live on Tawlity. Monthly report sent every first week of the month.",
  lost: "Lost. Keep in touch and re-approach in 6 months.",
};

/** Deal notes by stage. */
export const dealNotesByStage: Record<string, string[]> = {
  lead: [
    "Found them through Instagram; they get many booking requests in DMs. Plan a visit this week.",
    "Referral from another restaurant owner. Owner's number shared, call before Thursday.",
  ],
  visited: [
    "Visited at 4 pm before service. Manager interested, but the owner signs. Asked for a demo slot next week.",
    "They use a paper notebook for bookings and lost two large tables last weekend. Strong pain point.",
  ],
  "demo-done": [
    "Demo with the owner and the GM. Questions about WhatsApp reminders in Arabic and the diner app listing.",
    "Sent the proposal: {plan} plan, {fee} per month for {branches} branch(es).",
  ],
  trial: [
    "Trial started. 12 bookings in the first week, mostly through the diner app.",
    "Hosts still write bookings on paper in parallel. Booked a second training session.",
  ],
  negotiation: [
    "Owner asks for 10% off with a 12-month commitment. Checking with management.",
    "Counter-offer sent: first month free instead of a lower monthly fee.",
  ],
  signed: [
    "Signed! Contract start next Sunday. Onboarding checklist created.",
    "Payment received for the first month.",
  ],
  live: [
    "First live booking received through the app on day 2.",
    "Monthly report: bookings up, no-shows down. Owner happy.",
  ],
  lost: [
    "Decided to stay with their current system for now.",
    "No reply after three follow-ups. Closing the deal, will try again later.",
  ],
};

/** Diner notes and support interactions. */
export const dinerSupportTexts = [
  "Booking for 6 at 9 pm does not appear in the app, but the restaurant confirmed it by phone. Reported to the tech team.",
  "Asked to remove a no-show strike: their child was sick and they cancelled late. Approved once.",
  "Could not join the waitlist at the restaurant, the app kept loading. Asked them to update to the latest version.",
  "Wants to change the phone number on their account after switching operators.",
  "Did not receive the WhatsApp confirmation for tonight's booking. Resent it manually.",
  "Complained that the restaurant cancelled their booking 30 minutes before. Followed up with the restaurant manager.",
];

export const dinerNoteTexts = [
  "Regular at several Salmiya restaurants, usually books for 4 on Thursday nights. Prefers outdoor seating.",
  "Celebrates their wedding anniversary in March; good candidate for a special offer.",
  "Called to thank the team: the waitlist SMS saved them 40 minutes of waiting.",
  "Corporate customer: books lunches for their team almost every week.",
  "Left a 5-star review after their first booking through the app.",
];
