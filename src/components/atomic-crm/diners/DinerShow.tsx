import { Mail, MessageCircle, Phone } from "lucide-react";
import { ShowBase, useShowContext, useTranslate } from "ra-core";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditButton } from "@/components/admin/edit-button";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { Card, CardContent } from "@/components/ui/card";
import { useListContext } from "ra-core";
import { Link } from "react-router";

import { AsideSection } from "../misc/AsideSection";
import { useChoiceLabel } from "../tawlity/ChoiceLabel";
import { languageChoices } from "../tawlity/choices";
import { formatDateDMY } from "../tawlity/kuwait";
import type { Company, Diner } from "../types";
import {
  acquisitionSourceChoices,
  dinerGenderChoices,
  getDinerName,
  platformChoices,
} from "./dinerModel";
import { DinerNotes } from "./DinerNotes";
import { DinerStatusBadge } from "./DinerStatusBadge";
import { DinerTagsList } from "./DinerTagsList";
import { NoShowRate } from "./NoShowRate";

export const DinerShow = () => (
  <ShowBase>
    <DinerShowContent />
  </ShowBase>
);

const DinerShowContent = () => {
  const translate = useTranslate();
  const { record, isPending } = useShowContext<Diner>();
  if (isPending || !record) return null;

  return (
    <div className="mt-2 mb-2 flex flex-col md:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h5 className="text-xl font-semibold flex items-center gap-2">
                  {getDinerName(record)}
                  <DinerStatusBadge status={record.status} />
                </h5>
                <div className="mt-1">
                  <DinerTagsList ids={record.tags} />
                </div>
              </div>
            </div>
            <DinerStats diner={record} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h6 className="text-lg font-semibold mb-4">
              {translate("resources.diner_notes.name", { smart_count: 2 })}
            </h6>
            <DinerNotes />
          </CardContent>
        </Card>
      </div>
      <DinerAside diner={record} />
    </div>
  );
};

const Stat = ({ label, children }: { label: string; children: unknown }) => (
  <div className="flex flex-col rounded-lg border p-3">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xl font-semibold">{children as React.ReactNode}</span>
  </div>
);

const DinerStats = ({ diner }: { diner: Diner }) => {
  const translate = useTranslate();
  const field = (name: string) => translate(`resources.diners.fields.${name}`);
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Stat label={field("total_reservations")}>
        {diner.total_reservations ?? 0}
      </Stat>
      <Stat label={field("total_no_shows")}>{diner.total_no_shows ?? 0}</Stat>
      <Stat label={field("no_show_rate")}>
        <NoShowRate diner={diner} />
      </Stat>
      <Stat label={field("total_cancellations")}>
        {diner.total_cancellations ?? 0}
      </Stat>
      <Stat label={field("last_booking_date")}>
        {formatDateDMY(diner.last_booking_date) || "—"}
      </Stat>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: unknown }) =>
  value === null || value === undefined || value === "" ? null : (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      {value as React.ReactNode}
    </div>
  );

const DinerAside = ({ diner }: { diner: Diner }) => {
  const translate = useTranslate();
  const field = (name: string) => translate(`resources.diners.fields.${name}`);
  const platform = useChoiceLabel(platformChoices);
  const source = useChoiceLabel(acquisitionSourceChoices);
  const language = useChoiceLabel(languageChoices);
  const gender = useChoiceLabel(dinerGenderChoices);
  const waNumber = diner.phone?.replace(/\D/g, "");

  return (
    <div className="w-full md:w-92 md:min-w-92 text-sm">
      <div className="mb-4 -ml-1">
        <EditButton label="resources.diners.action.edit" />
      </div>

      <AsideSection
        title={translate("resources.diners.field_categories.identity")}
      >
        {diner.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${waNumber}`} className="hover:underline">
              {diner.phone}
            </a>
            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
        {diner.email ? (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <a href={`mailto:${diner.email}`} className="hover:underline">
              {diner.email}
            </a>
          </div>
        ) : null}
        <Row
          label={field("preferred_language")}
          value={language(diner.preferred_language)}
        />
        <Row label={field("gender")} value={gender(diner.gender)} />
      </AsideSection>

      <AsideSection
        title={translate("resources.diners.field_categories.account")}
      >
        <Row
          label={field("signup_date")}
          value={formatDateDMY(diner.signup_date)}
        />
        <Row
          label={field("signup_platform")}
          value={platform(diner.signup_platform)}
        />
        <Row
          label={field("acquisition_source")}
          value={source(diner.acquisition_source)}
        />
      </AsideSection>

      <AsideSection
        title={translate("resources.diners.field_categories.marketing")}
      >
        <Row
          label={field("whatsapp_consent")}
          value={
            diner.whatsapp_consent
              ? `${translate("ra.boolean.true")} (${formatDateDMY(diner.whatsapp_consent_date)})`
              : translate("ra.boolean.false")
          }
        />
      </AsideSection>

      <AsideSection title={field("favourite_restaurant_ids")}>
        {diner.favourite_restaurant_ids?.length ? (
          <ReferenceArrayField
            source="favourite_restaurant_ids"
            reference="companies"
          >
            <FavouriteRestaurants />
          </ReferenceArrayField>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </AsideSection>

      <div className="mt-6 pt-6 border-t flex flex-col gap-2 items-start">
        <DeleteButton
          className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
          size="sm"
        />
      </div>
    </div>
  );
};

const FavouriteRestaurants = () => {
  const { data } = useListContext<Company>();
  if (!data) return null;
  return (
    <div className="flex flex-col gap-1">
      {data.map((restaurant) => (
        <Link
          key={restaurant.id}
          to={`/companies/${restaurant.id}/show`}
          className="underline hover:no-underline"
        >
          {restaurant.name}
        </Link>
      ))}
    </div>
  );
};
