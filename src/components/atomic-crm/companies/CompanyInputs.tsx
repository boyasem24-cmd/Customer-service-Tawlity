import { required, useRecordContext, useTranslate } from "ra-core";
import { ReferenceInput } from "@/components/admin/reference-input";
import { TextInput } from "@/components/admin/text-input";
import { SelectInput } from "@/components/admin/select-input";
import { ArrayInput } from "@/components/admin/array-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatch } from "react-hook-form";

import ImageEditorField from "../misc/ImageEditorField";
import { isLinkedinUrl } from "../misc/isLinkedInUrl";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company, Sale } from "../types";
import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
import { sizes } from "./sizes";
import {
  accountStatusChoices,
  bookingSystemChoices,
  cuisineChoices,
  governorateChoices,
  leadSourceChoices,
  priceRangeChoices,
} from "../tawlity/choices";
import { parseKuwaitPhone, validateKuwaitPhone } from "../tawlity/kuwait";

const isUrl = (url: string) => {
  if (!url) return;
  const UrlRegex = new RegExp(
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i,
  );
  if (!UrlRegex.test(url)) {
    return {
      message: "crm.validation.invalid_url",
      args: { _: "Must be a valid URL" },
    };
  }
};

export const CompanyInputs = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 p-1">
      <CompanyDisplayInputs />
      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className="flex flex-col gap-10 flex-1">
          <RestaurantProfileInputs />
          <RestaurantAccountInputs />
          <CompanyContactInputs />
        </div>
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <div className="flex flex-col gap-8 flex-1">
          <CompanyAddressInputs />
          <HoldingGroupInputs />
          <CompanyAdditionalInformationInputs />
          <CompanyContextInputs />
        </div>
      </div>
    </div>
  );
};

const CompanyDisplayInputs = () => {
  const translate = useTranslate();
  const record = useRecordContext<Company>();
  return (
    <div className="flex gap-4 flex-1 flex-row">
      <ImageEditorField
        source="logo"
        type="avatar"
        width={60}
        height={60}
        emptyText={record?.name.charAt(0)}
        linkPosition="bottom"
      />
      <TextInput
        source="name"
        className="w-full h-fit"
        validate={required()}
        helperText={false}
        placeholder={translate("resources.companies.fields.name", {
          _: "Restaurant name",
        })}
      />
    </div>
  );
};

const CompanyContactInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.contact", {
          _: "Company info",
        })}
      </h6>
      <TextInput
        source="phone_number"
        dir="ltr"
        helperText={false}
        placeholder="+965 1234 5678"
        validate={validateKuwaitPhone}
        parse={parseKuwaitPhone}
      />
      <TextInput
        source="instagram_handle"
        helperText={false}
        placeholder="@restaurant"
        parse={(value: string) =>
          value ? `@${value.replace(/^@+/, "").trim()}` : value
        }
      />
      <TextInput source="website" helperText={false} validate={isUrl} />
      <TextInput
        source="linkedin_url"
        helperText={false}
        validate={isLinkedinUrl}
      />
    </div>
  );
};

const RestaurantProfileInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.restaurant", {
          _: "Restaurant",
        })}
      </h6>
      <AutocompleteArrayInput
        source="cuisines"
        choices={cuisineChoices}
        helperText={false}
      />
      <SelectInput
        source="price_range"
        choices={priceRangeChoices}
        helperText={false}
      />
      <div className="flex gap-4">
        <NumberInput
          source="nb_branches"
          helperText={false}
          min={0}
          step={1}
          className="flex-1"
        />
        <NumberInput
          source="seating_capacity"
          helperText={false}
          min={0}
          step={1}
          className="flex-1"
        />
      </div>
      <SelectInput
        source="booking_system"
        choices={bookingSystemChoices}
        helperText={false}
      />
    </div>
  );
};

const RestaurantAccountInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.account", {
          _: "Account",
        })}
      </h6>
      <SelectInput
        source="account_status"
        choices={accountStatusChoices}
        helperText={false}
        validate={required()}
      />
      <SelectInput
        source="lead_source"
        choices={leadSourceChoices}
        helperText={false}
      />
      <BooleanInput source="kga_member" helperText={false} />
    </div>
  );
};

const HoldingGroupInputs = () => {
  const translate = useTranslate();
  const record = useRecordContext<Company>();
  const isHolding = useWatch({ name: "is_holding" });
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.holding", {
          _: "Holding group",
        })}
      </h6>
      <BooleanInput source="is_holding" helperText={false} />
      {!isHolding && (
        <ReferenceInput
          source="parent_company_id"
          reference="companies"
          filter={{
            is_holding: true,
            ...(record?.id != null ? { "id@neq": record.id } : {}),
          }}
          sort={{ field: "name", order: "ASC" }}
        >
          <AutocompleteInput
            helperText={false}
            optionText="name"
            label="resources.companies.fields.parent_company_id"
          />
        </ReferenceInput>
      )}
    </div>
  );
};

const CompanyContextInputs = () => {
  const translate = useTranslate();
  const { companySectors } = useConfigurationContext();
  const translatedSizes = sizes.map((size) => ({
    ...size,
    name: getTranslatedCompanySizeLabel(size, translate),
  }));
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.context", {
          _: "Context",
        })}
      </h6>
      <SelectInput
        source="sector"
        choices={companySectors}
        optionText="label"
        optionValue="value"
        helperText={false}
      />
      <SelectInput source="size" choices={translatedSizes} helperText={false} />
      <TextInput source="revenue" helperText={false} />
      <TextInput source="tax_identifier" helperText={false} />
      <TextInput source="zipcode" helperText={false} />
    </div>
  );
};

const CompanyAddressInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.address", {
          _: "Address",
        })}
      </h6>
      <SelectInput
        source="governorate"
        choices={governorateChoices}
        helperText={false}
      />
      <TextInput source="area" helperText={false} />
      <TextInput source="address" helperText={false} />
      <TextInput
        source="google_maps_url"
        helperText={false}
        validate={isUrl}
        placeholder="https://maps.app.goo.gl/..."
      />
      <TextInput source="city" helperText={false} />
      <TextInput source="country" helperText={false} />
    </div>
  );
};

const CompanyAdditionalInformationInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.additional_info", {
          _: "Additional information",
        })}
      </h6>
      <TextInput source="description" multiline helperText={false} />
      <ArrayInput source="context_links" helperText={false}>
        <SimpleFormIterator disableReordering fullWidth getItemLabel={false}>
          <TextInput
            source=""
            label={false}
            helperText={false}
            validate={isUrl}
          />
        </SimpleFormIterator>
      </ArrayInput>
      <ReferenceInput
        source="sales_id"
        reference="sales"
        filter={{
          "disabled@neq": true,
        }}
      >
        <SelectInput helperText={false} optionText={saleOptionRenderer} />
      </ReferenceInput>
    </div>
  );
};

const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;
