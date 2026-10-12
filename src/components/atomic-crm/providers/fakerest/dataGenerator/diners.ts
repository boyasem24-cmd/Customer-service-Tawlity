import { subDays } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import type { Diner, DinerNote, DinerTag } from "../../../types";
import type { Db } from "./types";
import {
  firstNamesFemale,
  firstNamesMale,
  lastNames,
  randomKuwaitMobile,
} from "./kuwaitData";
import { randomDate, weightedArrayElement, weightedBoolean } from "./utils";

export const generateDinerTags = (_: Db): DinerTag[] => [
  { id: 0, name: "VIP", color: "#F5C842" },
  { id: 1, name: "Frequent no-show", color: "#fda4af" },
  { id: 2, name: "New", color: "#bbf7d0" },
  { id: 3, name: "Corporate", color: "#bfdbfe" },
  { id: 4, name: "Family", color: "#e9d5ff" },
];

const toDateOnly = (date: Date) => date.toISOString().split("T")[0];

export const generateDiners = (db: Db, size = 80): Diner[] => {
  const usedPhones = new Set<string>();
  const restaurants = db.companies.filter((c) => !c.is_holding);

  return Array.from(Array(size).keys()).map((id) => {
    const gender = random.arrayElement(["male", "female"]);
    const first_name = random.arrayElement(
      gender === "female" ? firstNamesFemale : firstNamesMale,
    );
    const last_name = random.arrayElement(lastNames);
    let phone = randomKuwaitMobile();
    while (usedPhones.has(phone)) phone = randomKuwaitMobile();
    usedPhones.add(phone);

    const signup = randomDate(subDays(new Date(), 540));
    const total_reservations = weightedArrayElement(
      [
        0,
        datatype.number({ min: 1, max: 5 }),
        datatype.number({ min: 6, max: 40 }),
      ],
      [1, 5, 3],
    );
    const noShowHeavy = weightedBoolean(15);
    const total_no_shows = total_reservations
      ? Math.min(
          total_reservations,
          noShowHeavy
            ? Math.ceil(
                total_reservations * random.arrayElement([0.25, 0.35, 0.5]),
              )
            : weightedArrayElement([0, 1], [4, 1]),
        )
      : 0;
    const total_cancellations = total_reservations
      ? datatype.number({ min: 0, max: Math.ceil(total_reservations / 4) })
      : 0;
    const last_booking = total_reservations ? randomDate(signup) : null;
    const isNew = signup > subDays(new Date(), 30);
    const whatsapp_consent = weightedBoolean(60);

    const tags: number[] = [];
    if (total_reservations > 20) tags.push(0);
    if (total_no_shows / (total_reservations || 1) > 0.2) tags.push(1);
    if (isNew) tags.push(2);
    if (weightedBoolean(10)) tags.push(random.arrayElement([3, 4]));

    const status = weightedBoolean(4)
      ? "blocked"
      : last_booking && last_booking > subDays(new Date(), 60)
        ? "active"
        : "inactive";

    const digits = phone.replace(/\D/g, "");
    return {
      id,
      first_name,
      last_name,
      phone,
      phone_digits: digits,
      email: weightedBoolean(70)
        ? `${first_name}.${last_name}`
            .toLowerCase()
            .replace(/[^a-z.]/g, "")
            .concat(`${id}@gmail.com`)
        : null,
      preferred_language: weightedBoolean(65) ? "ar" : "en",
      gender,
      signup_date: toDateOnly(signup),
      signup_platform: weightedArrayElement(
        ["ios", "android", "web"],
        [5, 4, 1],
      ),
      acquisition_source: weightedArrayElement(
        ["organic", "meta_ad", "referral", "restaurant_qr", "other"],
        [5, 4, 2, 3, 1],
      ),
      total_reservations,
      total_no_shows,
      total_cancellations,
      last_booking_date: last_booking ? toDateOnly(last_booking) : null,
      favourite_restaurant_ids: random
        .arrayElements(restaurants, random.arrayElement([0, 1, 1, 2, 3]))
        .map((r) => r.id),
      whatsapp_consent,
      whatsapp_consent_date: whatsapp_consent ? toDateOnly(signup) : null,
      status,
      tags,
      created_at: signup.toISOString(),
      updated_at: signup.toISOString(),
    };
  });
};

const supportTexts = [
  "Reservation not showing in the app after booking.",
  "Asked to remove a no-show strike after a family emergency.",
  "Could not join the waitlist, app kept loading.",
  "Wants to change the phone number on the account.",
];

const noteTexts = [
  "Prefers outdoor seating, usually books for 4.",
  "Celebrates anniversary in March — send an offer.",
  "Called to thank the team for the quick waitlist.",
];

export const generateDinerNotes = (db: Db): DinerNote[] =>
  Array.from(Array(60).keys()).map((id) => {
    const diner = random.arrayElement(db.diners);
    const isSupport = weightedBoolean(55);
    return {
      id,
      diner_id: diner.id,
      text:
        random.arrayElement(isSupport ? supportTexts : noteTexts) ||
        lorem.sentence(),
      date: randomDate(subDays(new Date(), 90)).toISOString(),
      sales_id: random.arrayElement(db.sales).id,
      kind: isSupport ? "support" : "note",
      support_status: isSupport
        ? weightedArrayElement(["open", "resolved"], [2, 3])
        : null,
    };
  });
