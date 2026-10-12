import { datatype, random } from "faker/locale/en_US";

import { restaurantDescriptions } from "./realisticContent";

import { randomDate, weightedArrayElement, weightedBoolean } from "./utils";
import {
  bookingSystemChoices,
  governorateChoices,
  leadSourceChoices,
} from "../../../tawlity/choices";
import type { Company, RAFile } from "../../../types";
import type { Db } from "./types";
import {
  areasByGovernorate,
  holdingGroups,
  randomKuwaitLandline,
  restaurantNames,
  slugify,
} from "./kuwaitData";

const accountStatuses = ["prospect", "onboarding", "live", "paused", "churned"];
const accountStatusWeights = [10, 4, 9, 2, 2];

const emptyLogo = { src: "", title: "" } as RAFile;

/**
 * Generates restaurants: a few holding groups owning several brands, plus
 * independent restaurants. `size` is kept for compatibility with the original
 * Atomic CRM model (it drives how many contacts a restaurant gets).
 */
export const generateCompanies = (db: Db): Required<Company>[] => {
  const companies: Required<Company>[] = [];
  const names = [...restaurantNames];

  const base = (id: number, name: string): Required<Company> => {
    const governorate = random.arrayElement(governorateChoices).id;
    const slug = slugify(name);
    return {
      id,
      name,
      logo: emptyLogo,
      sector: "consumer-discretionary",
      size: random.arrayElement([1, 10, 10, 50]) as 1 | 10 | 50,
      linkedin_url: "",
      website: weightedBoolean(60) ? `https://${slug}.com.kw` : "",
      phone_number: randomKuwaitLandline(),
      address: `Block ${datatype.number({ min: 1, max: 12 })}, Street ${datatype.number({ min: 1, max: 40 })}`,
      zipcode: "",
      city: "",
      state_abbr: "",
      nb_contacts: 0,
      nb_deals: 0,
      // at least 1/3rd of restaurants for Jane Doe
      sales_id: datatype.number(2) === 0 ? 0 : random.arrayElement(db.sales).id,
      created_at: randomDate().toISOString(),
      description: random.arrayElement(restaurantDescriptions),
      revenue: "",
      tax_identifier: "",
      country: "Kuwait",
      context_links: [],
      is_holding: false,
      parent_company_id: null,
      parent_company_name: null,
      nb_brands: 0,
      cuisines: [],
      governorate,
      area: random.arrayElement(areasByGovernorate[governorate]),
      nb_branches: 1,
      seating_capacity: datatype.number({ min: 20, max: 180 }),
      price_range: "KD",
      booking_system: weightedArrayElement(
        bookingSystemChoices.map((c) => c.id),
        [6, 2, 2, 4, 1],
      ),
      kga_member: weightedBoolean(35),
      instagram_handle: `@${slug}`,
      google_maps_url: `https://maps.google.com/?q=${encodeURIComponent(name + " Kuwait")}`,
      lead_source: random.arrayElement(leadSourceChoices).id,
      account_status: weightedArrayElement(
        accountStatuses,
        accountStatusWeights,
      ),
      contract_start_date: null,
      renewal_date: null,
      plan: null,
      monthly_fee: null,
      onboarding_checklist: {},
      last_report_sent_at: null,
      health: null,
      health_note: null,
    };
  };

  const addRestaurant = (parent?: Required<Company>) => {
    const [name, cuisines, priceRange] = names.shift() ?? [
      `Restaurant ${companies.length}`,
      ["other"],
      "KD",
    ];
    const restaurant = base(companies.length, name);
    restaurant.cuisines = cuisines;
    restaurant.price_range = priceRange;
    restaurant.nb_branches = weightedArrayElement([1, 2, 3, 5], [6, 3, 2, 1]);
    if (parent) {
      restaurant.parent_company_id = parent.id;
      restaurant.parent_company_name = parent.name;
      restaurant.sales_id = parent.sales_id;
      restaurant.lead_source = parent.lead_source;
      parent.nb_brands = (parent.nb_brands ?? 0) + 1;
    }
    companies.push(restaurant);
  };

  holdingGroups.forEach((group) => {
    const holding = base(companies.length, group.name);
    holding.is_holding = true;
    holding.size = 50;
    holding.seating_capacity = null;
    holding.nb_branches = null;
    holding.booking_system = null;
    holding.price_range = null;
    holding.instagram_handle = null;
    holding.google_maps_url = null;
    holding.account_status = random.arrayElement(["prospect", "live"]);
    companies.push(holding);
    for (let i = 0; i < group.brands; i++) addRestaurant(holding);
  });

  while (names.length) addRestaurant();

  companies.forEach(applyAccountData);

  return companies;
};

const planFees: Record<string, number> = {
  free_trial: 0,
  starter: 25,
  pro: 45,
  group_enterprise: 120,
};

const toDateOnly = (date: Date) => date.toISOString().split("T")[0];

/** Fills the account panel (contract, plan, checklist, health) for signed restaurants. */
const applyAccountData = (restaurant: Required<Company>) => {
  if (restaurant.is_holding || restaurant.account_status === "prospect") {
    return;
  }
  const plan =
    restaurant.account_status === "onboarding"
      ? random.arrayElement(["free_trial", "starter", "pro"])
      : weightedArrayElement(["starter", "pro", "group_enterprise"], [5, 4, 1]);
  const start = randomDate(new Date(Date.now() - 400 * 24 * 3600 * 1000));
  const renewal = new Date(start);
  renewal.setFullYear(renewal.getFullYear() + 1);
  if (renewal < new Date()) renewal.setFullYear(renewal.getFullYear() + 1);
  restaurant.plan = plan;
  restaurant.monthly_fee =
    plan === "free_trial"
      ? 0
      : planFees[plan] * Math.max(1, restaurant.nb_branches ?? 1) +
        datatype.number({ min: 0, max: 4 }) * 0.25;
  restaurant.contract_start_date = toDateOnly(start);
  restaurant.renewal_date = toDateOnly(renewal);
  const done =
    restaurant.account_status === "onboarding"
      ? datatype.number({ min: 0, max: 4 })
      : 5;
  restaurant.onboarding_checklist = {
    menu_uploaded: done > 0,
    tables_configured: done > 1,
    staff_trained: done > 2,
    first_live_booking: done > 3,
    listed_in_app: done > 4,
  };
  if (restaurant.account_status !== "onboarding") {
    restaurant.last_report_sent_at = toDateOnly(
      randomDate(new Date(Date.now() - 60 * 24 * 3600 * 1000)),
    );
  }
  if (restaurant.account_status === "live") {
    restaurant.health = weightedArrayElement(
      ["green", "amber", "red"],
      [6, 3, 2],
    );
    restaurant.health_note = {
      green: "Steady weekly bookings, team uses the app daily.",
      amber: "Bookings dropped this month; schedule a check-in visit.",
      red: "Owner unhappy with no-shows, considering pausing.",
    }[restaurant.health as "green" | "amber" | "red"];
  }
};
