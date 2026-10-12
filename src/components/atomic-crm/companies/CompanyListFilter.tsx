import {
  BadgeCheck,
  Building2,
  MapPin,
  Megaphone,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { FilterLiveForm, useGetIdentity, useTranslate } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";
import { AccountManagerFilter } from "../sales/AccountManagerInput";
import {
  accountStatusChoices,
  cuisineChoices,
  governorateChoices,
  leadSourceChoices,
} from "../tawlity/choices";
import { AccountStatusBadge } from "../tawlity/ChoiceLabel";

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  return (
    <div className="w-52 min-w-52 flex flex-col gap-8">
      <FilterLiveForm>
        <SearchInput source="q" />
      </FilterLiveForm>

      <FilterCategory
        icon={<BadgeCheck className="h-4 w-4" />}
        label="resources.companies.fields.account_status"
      >
        {accountStatusChoices.map((choice) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={<AccountStatusBadge status={choice.id} />}
            key={choice.id}
            value={{ account_status: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<MapPin className="h-4 w-4" />}
        label="resources.companies.fields.governorate"
      >
        {governorateChoices.map((choice) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={choice.name}
            key={choice.id}
            value={{ governorate: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<UtensilsCrossed className="h-4 w-4" />}
        label="resources.companies.fields.cuisines"
      >
        {cuisineChoices.map((choice) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={choice.name}
            key={choice.id}
            value={{ "cuisines@cs": `{${choice.id}}` }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Megaphone className="h-4 w-4" />}
        label="resources.companies.fields.lead_source"
      >
        {leadSourceChoices.map((choice) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={choice.name}
            key={choice.id}
            value={{ lead_source: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Building2 className="h-4 w-4" />}
        label="resources.companies.holding_company"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label="resources.companies.filters.holdings_only"
          value={{ is_holding: true }}
        />
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="resources.companies.fields.sales_id"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.common.me")}
          value={{ sales_id: identity?.id }}
        />
        <AccountManagerFilter className="w-full justify-between" />
      </FilterCategory>
    </div>
  );
};
