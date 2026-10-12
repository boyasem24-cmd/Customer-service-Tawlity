import { Instagram, MapPin } from "lucide-react";
import { ReferenceField } from "@/components/admin/reference-field";
import { useTranslate } from "ra-core";

import { AsideSection } from "../misc/AsideSection";
import { ChoiceLabels } from "../tawlity/ChoiceLabel";
import {
  bookingSystemChoices,
  cuisineChoices,
  governorateChoices,
  leadSourceChoices,
  priceRangeChoices,
} from "../tawlity/choices";
import type { Company } from "../types";

const Row = ({ label, children }: { label: string; children: unknown }) =>
  children === null || children === undefined || children === "" ? null : (
    <div className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      {children as React.ReactNode}
    </div>
  );

export const RestaurantInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const field = (name: string) =>
    translate(`resources.companies.fields.${name}`);

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.restaurant")}
    >
      <div className="flex flex-col gap-1">
        {record.cuisines?.length ? (
          <Row label={field("cuisines")}>
            <ChoiceLabels choices={cuisineChoices} values={record.cuisines} />
          </Row>
        ) : null}
        {record.price_range ? (
          <Row label={field("price_range")}>
            <ChoiceLabels
              choices={priceRangeChoices}
              values={record.price_range}
            />
          </Row>
        ) : null}
        <Row label={field("nb_branches")}>{record.nb_branches}</Row>
        <Row label={field("seating_capacity")}>{record.seating_capacity}</Row>
        {record.booking_system ? (
          <Row label={field("booking_system")}>
            <ChoiceLabels
              choices={bookingSystemChoices}
              values={record.booking_system}
            />
          </Row>
        ) : null}
        {record.lead_source ? (
          <Row label={field("lead_source")}>
            <ChoiceLabels
              choices={leadSourceChoices}
              values={record.lead_source}
            />
          </Row>
        ) : null}
        <Row label={field("kga_member")}>
          {translate(
            record.kga_member ? "ra.boolean.true" : "ra.boolean.false",
          )}
        </Row>
      </div>
    </AsideSection>
  );
};

export const RestaurantLocationInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (
    !record.governorate &&
    !record.area &&
    !record.address &&
    !record.google_maps_url &&
    !record.instagram_handle
  ) {
    return null;
  }
  return (
    <AsideSection
      title={translate("resources.companies.field_categories.address")}
    >
      <div className="flex flex-col gap-1 text-sm">
        {record.governorate || record.area ? (
          <div>
            {record.area}
            {record.area && record.governorate ? ", " : null}
            <ChoiceLabels
              choices={governorateChoices}
              values={record.governorate}
            />
          </div>
        ) : null}
        {record.address ? <div>{record.address}</div> : null}
        {record.city || record.country ? (
          <div>{[record.city, record.country].filter(Boolean).join(", ")}</div>
        ) : null}
        {record.google_maps_url ? (
          <a
            className="flex items-center gap-1 underline hover:no-underline"
            href={record.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin className="w-4 h-4" />
            Google Maps
          </a>
        ) : null}
        {record.instagram_handle ? (
          <a
            className="flex items-center gap-1 underline hover:no-underline"
            href={`https://instagram.com/${record.instagram_handle.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="w-4 h-4" />
            {record.instagram_handle}
          </a>
        ) : null}
      </div>
    </AsideSection>
  );
};

export const HoldingInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (!record.is_holding && record.parent_company_id == null) return null;
  return (
    <AsideSection
      title={translate("resources.companies.field_categories.holding")}
    >
      <div className="text-sm">
        {record.is_holding ? (
          translate("resources.companies.holding_company")
        ) : (
          <>
            <span className="text-muted-foreground">
              {translate("resources.companies.fields.parent_company_id")}:{" "}
            </span>
            <ReferenceField
              source="parent_company_id"
              reference="companies"
              record={record}
              link="show"
            />
          </>
        )}
      </div>
    </AsideSection>
  );
};
