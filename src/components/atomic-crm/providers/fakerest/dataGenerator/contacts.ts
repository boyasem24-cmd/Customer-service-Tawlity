import { random } from "faker/locale/en_US";

import { contactBackgrounds, fill } from "./realisticContent";

import { defaultNoteStatuses } from "../../../root/defaultConfiguration";
import { contactGender } from "../../../contacts/contactModel";
import type { Company, Contact } from "../../../types";
import type { Db } from "./types";
import { randomDate, weightedArrayElement, weightedBoolean } from "./utils";
import {
  firstNamesFemale,
  firstNamesMale,
  lastNames,
  randomKuwaitLandline,
  randomKuwaitMobile,
} from "./kuwaitData";

const roleTitles: Record<string, string[]> = {
  owner: ["Owner", "Founder", "Co-founder"],
  partner: ["Managing Partner", "Partner"],
  general_manager: ["General Manager", "Restaurant Manager"],
  operations_manager: ["F&B Manager", "Operations Manager", "Head of F&B"],
  marketing: ["Marketing Manager", "Social Media Lead"],
  front_of_house: ["Head Host", "Front of House Manager", "Reservations Lead"],
  other: ["Head Chef", "Finance Manager", "Executive Assistant"],
};
const roles = Object.keys(roleTitles);
const roleWeights = [4, 2, 4, 3, 2, 2, 1];

const maxContacts = {
  1: 1,
  10: 4,
  50: 12,
  250: 25,
  500: 50,
};

const getRandomContactDetailsType = () =>
  random.arrayElement(["Work", "Home", "Other"]) as "Work" | "Home" | "Other";

export const generateContacts = (db: Db, size = 120): Required<Contact>[] => {
  const nbAvailblePictures = 223;
  let numberOfContacts = 0;

  return Array.from(Array(size).keys()).map((id) => {
    const has_avatar =
      weightedBoolean(25) && numberOfContacts < nbAvailblePictures;
    const gender = random.arrayElement(contactGender.slice(0, 2)).value;
    const first_name = random.arrayElement(
      gender === "female" ? firstNamesFemale : firstNamesMale,
    );
    const last_name = random.arrayElement(lastNames);
    const role = weightedArrayElement(roles, roleWeights) as string;
    const avatar = {
      src: has_avatar
        ? "https://marmelab.com/posters/avatar-" +
          (223 - numberOfContacts) +
          ".jpeg"
        : undefined,
    };
    const title = random.arrayElement(roleTitles[role]);

    if (has_avatar) {
      numberOfContacts++;
    }

    // choose company with people left to know
    let company: Company;
    do {
      company = random.arrayElement(db.companies);
    } while ((company.nb_contacts ?? 0) >= maxContacts[company.size]);
    company.nb_contacts = (company.nb_contacts ?? 0) + 1;

    const domain = company.website
      ? company.website.replace(/^https?:\/\//, "")
      : "gmail.com";
    const email_jsonb = [
      {
        email: `${first_name}.${last_name}`
          .toLowerCase()
          .replace(/[^a-z.]/g, "")
          .concat(`@${domain}`),
        type: getRandomContactDetailsType(),
      },
    ];
    const phone_jsonb = [
      { number: randomKuwaitMobile(), type: "Work" as const },
      ...(weightedBoolean(40)
        ? [{ number: randomKuwaitLandline(), type: "Other" as const }]
        : []),
    ];
    const first_seen = randomDate(new Date(company.created_at)).toISOString();
    const last_seen = first_seen;

    return {
      id,
      first_name,
      last_name,
      gender,
      title,
      company_id: company.id,
      company_name: company.name,
      email_jsonb,
      phone_jsonb,
      background: fill(random.arrayElement(contactBackgrounds), {
        area: company.area,
      }),
      acquisition: random.arrayElement(["inbound", "outbound"]),
      avatar,
      first_seen: first_seen,
      last_seen: last_seen,
      has_newsletter: weightedBoolean(30),
      status: random.arrayElement(defaultNoteStatuses).value,
      tags: random
        .arrayElements(db.tags, random.arrayElement([0, 0, 0, 1, 1, 2]))
        .map((tag) => tag.id), // finalize
      sales_id: company.sales_id!,
      nb_tasks: 0,
      linkedin_url: null,
      role,
      preferred_language: weightedBoolean(55) ? "ar" : "en",
      is_decision_maker: role === "owner" || role === "partner",
    };
  });
};
