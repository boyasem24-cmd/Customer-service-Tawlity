import {
  email,
  required,
  useDataProvider,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import { languageChoices } from "../tawlity/choices";
import {
  normalizeKuwaitPhone,
  parseKuwaitPhone,
  validateKuwaitPhone,
} from "../tawlity/kuwait";
import type { Diner } from "../types";
import {
  acquisitionSourceChoices,
  dinerGenderChoices,
  dinerStatusChoices,
  platformChoices,
} from "./dinerModel";

export const DinerInputs = () => {
  const isMobile = useIsMobile();
  return (
    <div className={`flex gap-6 p-1 ${isMobile ? "flex-col" : "flex-row"}`}>
      <div className="flex flex-col gap-8 flex-1">
        <DinerIdentityInputs />
        <DinerAccountInputs />
      </div>
      <Separator orientation={isMobile ? "horizontal" : "vertical"} />
      <div className="flex flex-col gap-8 flex-1">
        <DinerStatsInputs />
        <DinerMarketingInputs />
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: unknown }) => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">{translate(title)}</h6>
      {children as React.ReactNode}
    </div>
  );
};

/** Phones are unique among diners: refuse a number another diner already uses. */
const useUniquePhoneValidator = () => {
  const dataProvider = useDataProvider();
  const record = useRecordContext<Diner>();
  return async (value: string) => {
    const phone = normalizeKuwaitPhone(value);
    if (!phone) return undefined;
    const { data } = await dataProvider.getList<Diner>("diners", {
      filter: { phone },
      pagination: { page: 1, perPage: 2 },
      sort: { field: "id", order: "ASC" },
    });
    const duplicate = data.find((diner) => diner.id !== record?.id);
    return duplicate
      ? {
          message: "resources.diners.validation.phone_taken",
          args: {
            name: `${duplicate.first_name} ${duplicate.last_name}`,
            _: "This phone number is already used by another diner",
          },
        }
      : undefined;
  };
};

const DinerIdentityInputs = () => {
  const uniquePhone = useUniquePhoneValidator();
  return (
    <Section title="resources.diners.field_categories.identity">
      <div className="flex gap-4">
        <TextInput
          source="first_name"
          validate={required()}
          helperText={false}
          className="flex-1"
        />
        <TextInput
          source="last_name"
          validate={required()}
          helperText={false}
          className="flex-1"
        />
      </div>
      <TextInput
        source="phone"
        placeholder="+965 1234 5678"
        validate={[required(), validateKuwaitPhone, uniquePhone]}
        parse={parseKuwaitPhone}
        helperText={false}
      />
      <TextInput source="email" validate={email()} helperText={false} />
      <RadioButtonGroupInput
        source="preferred_language"
        label="resources.diners.fields.preferred_language"
        choices={languageChoices}
        row
        helperText={false}
      />
      <RadioButtonGroupInput
        source="gender"
        label="resources.diners.fields.gender"
        choices={dinerGenderChoices}
        row
        helperText={false}
      />
    </Section>
  );
};

const DinerAccountInputs = () => (
  <Section title="resources.diners.field_categories.account">
    <SelectInput
      source="status"
      choices={dinerStatusChoices}
      validate={required()}
      helperText={false}
    />
    <div className="flex gap-4">
      <DateInput source="signup_date" helperText={false} className="flex-1" />
      <SelectInput
        source="signup_platform"
        choices={platformChoices}
        helperText={false}
        className="flex-1"
      />
    </div>
    <SelectInput
      source="acquisition_source"
      choices={acquisitionSourceChoices}
      helperText={false}
    />
    <ReferenceArrayInput source="tags" reference="diner_tags">
      <AutocompleteArrayInput
        label="resources.diners.fields.tags"
        optionText="name"
        helperText={false}
      />
    </ReferenceArrayInput>
  </Section>
);

const DinerStatsInputs = () => (
  <Section title="resources.diners.field_categories.stats">
    <div className="grid grid-cols-3 gap-4">
      <NumberInput source="total_reservations" min={0} helperText={false} />
      <NumberInput source="total_no_shows" min={0} helperText={false} />
      <NumberInput source="total_cancellations" min={0} helperText={false} />
    </div>
    <DateInput source="last_booking_date" helperText={false} />
    <ReferenceArrayInput
      source="favourite_restaurant_ids"
      reference="companies"
      filter={{ is_holding: false }}
      sort={{ field: "name", order: "ASC" }}
    >
      <AutocompleteArrayInput
        label="resources.diners.fields.favourite_restaurant_ids"
        optionText="name"
        helperText={false}
      />
    </ReferenceArrayInput>
  </Section>
);

const DinerMarketingInputs = () => {
  const consent = useWatch({ name: "whatsapp_consent" });
  return (
    <Section title="resources.diners.field_categories.marketing">
      <BooleanInput source="whatsapp_consent" helperText={false} />
      {consent ? (
        <DateInput source="whatsapp_consent_date" helperText={false} />
      ) : null}
    </Section>
  );
};
