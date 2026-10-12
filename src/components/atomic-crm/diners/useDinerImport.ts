import { useCallback } from "react";
import { useDataProvider } from "ra-core";

import { createEachRow } from "../dataImport/createEachRow";
import { toInteger, toIsoDate, toText } from "../dataImport/parseCell";
import type { ImportCell, ProcessImportBatch } from "../dataImport/types";
import { normalizeKuwaitPhone } from "../tawlity/kuwait";
import type { Diner } from "../types";
import {
  acquisitionSourceChoices,
  dinerGenderChoices,
  dinerStatusChoices,
  platformChoices,
} from "./dinerModel";
import { languageChoices } from "../tawlity/choices";
import type { Choice } from "../tawlity/choices";

/**
 * Imports diners from a CSV file, matching on the phone number: a row whose
 * phone belongs to an existing diner updates that diner instead of creating a
 * duplicate. Rows without a valid Kuwaiti phone number are rejected.
 */
export function useDinerImport(): ProcessImportBatch {
  const dataProvider = useDataProvider();

  return useCallback(
    async (batch) => {
      const rows = batch.map((row) => ({
        phone: normalizeKuwaitPhone(toText(row.phone)),
        data: toDinerData(row),
      }));
      const phones = rows
        .map((row) => row.phone)
        .filter((phone): phone is string => !!phone);

      const { data: existing } = phones.length
        ? await dataProvider.getList<Diner>("diners", {
            filter: {
              "phone_digits@in": `(${phones.map(toDigits).join(",")})`,
            },
            pagination: { page: 1, perPage: phones.length },
            sort: { field: "id", order: "ASC" },
          })
        : { data: [] as Diner[] };
      const byPhone = new Map(
        existing.map((diner) => [toDigits(diner.phone), diner]),
      );

      return createEachRow(
        rows.map(async ({ phone, data }) => {
          if (!phone) {
            throw new Error("Missing or invalid Kuwaiti phone number");
          }
          const match = byPhone.get(toDigits(phone));
          if (match) {
            return dataProvider.update("diners", {
              id: match.id,
              data: { ...withoutEmpty(data), phone },
              previousData: match,
            });
          }
          return dataProvider.create("diners", {
            data: {
              status: "active",
              total_reservations: 0,
              total_no_shows: 0,
              total_cancellations: 0,
              whatsapp_consent: false,
              favourite_restaurant_ids: [],
              tags: [],
              ...withoutEmpty(data),
              phone,
            },
          });
        }),
      );
    },
    [dataProvider],
  );
}

const toDigits = (phone: string) => phone.replace(/\D/g, "");

const toChoice = (cell: ImportCell, choices: Choice[]) => {
  const value = toText(cell)?.toLowerCase();
  if (!value) return undefined;
  return choices.find((c) => c.id.toLowerCase() === value)?.id;
};

const toBoolean = (cell: ImportCell) => {
  if (typeof cell === "boolean") return cell;
  const value = toText(cell)?.toLowerCase();
  if (!value) return undefined;
  return ["true", "yes", "1", "y"].includes(value);
};

const toDinerData = (row: Record<string, ImportCell>): Partial<Diner> => ({
  first_name: toText(row.first_name),
  last_name: toText(row.last_name),
  email: toText(row.email),
  preferred_language: toChoice(row.preferred_language, languageChoices),
  gender: toChoice(row.gender, dinerGenderChoices),
  signup_date: toIsoDate(row.signup_date)?.split("T")[0],
  signup_platform: toChoice(row.signup_platform, platformChoices),
  acquisition_source: toChoice(
    row.acquisition_source,
    acquisitionSourceChoices,
  ),
  total_reservations: toInteger(row.total_reservations),
  total_no_shows: toInteger(row.total_no_shows),
  total_cancellations: toInteger(row.total_cancellations),
  last_booking_date: toIsoDate(row.last_booking_date)?.split("T")[0],
  whatsapp_consent: toBoolean(row.whatsapp_consent),
  whatsapp_consent_date: toIsoDate(row.whatsapp_consent_date)?.split("T")[0],
  status: toChoice(row.status, dinerStatusChoices),
});

/** Drops undefined values so an update never blanks a field the CSV left empty. */
const withoutEmpty = <T extends object>(data: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
