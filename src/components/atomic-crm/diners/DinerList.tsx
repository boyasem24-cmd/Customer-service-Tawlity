import {
  CalendarX,
  Globe,
  Languages,
  Megaphone,
  Smartphone,
  Tag,
  UserCheck,
} from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";

import { DataImportButton } from "../dataImport/DataImportButton";
import { FilterCategory } from "../filters/FilterCategory";
import { TopToolbar } from "../layout/TopToolbar";
import { ResponsiveFilters } from "../misc/ResponsiveFilters";
import { useChoiceLabel } from "../tawlity/ChoiceLabel";
import { languageChoices } from "../tawlity/choices";
import { formatDateDMY } from "../tawlity/kuwait";
import type { Diner, DinerTag } from "../types";
import {
  acquisitionSourceChoices,
  dinerStatusChoices,
  getDinerName,
  inactiveSinceFilter,
  platformChoices,
} from "./dinerModel";
import { DinerStatusBadge } from "./DinerStatusBadge";
import { DinerTagsList } from "./DinerTagsList";
import { NoShowRate } from "./NoShowRate";

export const DinerList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "last_booking_date", order: "DESC" }}
    actions={<DinerListActions />}
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
  >
    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8">
      <DinerListFilter />
      <div className="flex-1 min-w-0">
        <DinerTable />
      </div>
    </div>
  </List>
);

const DinerTable = () => {
  const platformLabel = useChoiceLabel(platformChoices);
  return (
    <DataTable<Diner> rowClick="show" bulkActionButtons={false}>
      <DataTable.Col
        source="last_name"
        label="resources.diners.fields.name"
        render={(diner) => (
          <div className="flex flex-col">
            <span className="font-medium">{getDinerName(diner)}</span>
            <DinerTagsList ids={diner.tags} />
          </div>
        )}
      />
      <DataTable.Col source="phone" disableSort />
      <DataTable.Col
        source="signup_platform"
        render={(diner) => platformLabel(diner.signup_platform)}
      />
      <DataTable.Col
        source="status"
        render={(diner) => <DinerStatusBadge status={diner.status} />}
      />
      <DataTable.NumberCol source="total_reservations" />
      <DataTable.Col
        source="total_no_shows"
        label="resources.diners.fields.no_show_rate"
        disableSort
        render={(diner) => <NoShowRate diner={diner as Diner} />}
      />
      <DataTable.Col
        source="last_booking_date"
        render={(diner) => formatDateDMY(diner.last_booking_date)}
      />
    </DataTable>
  );
};

const DinerListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar>
      <SortButton
        fields={[
          "last_booking_date",
          "signup_date",
          "total_reservations",
          "total_no_shows",
          "last_name",
        ]}
      />
      <DataImportButton resource="diners" />
      <ExportButton />
      <CreateButton
        label={translate("resources.diners.action.new", { _: "New Diner" })}
      />
    </TopToolbar>
  );
};

const filterButtonClass = "w-auto md:w-full justify-between h-10 md:h-8";

export const DinerListFilter = () => {
  const translate = useTranslate();
  const { data: tags } = useGetList<DinerTag>("diner_tags", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "name", order: "ASC" },
  });

  return (
    <ResponsiveFilters
      searchInput={{
        placeholder: translate("resources.diners.filters.search"),
      }}
    >
      <FilterCategory
        icon={<CalendarX className="h-4 w-4" />}
        label="resources.diners.fields.last_booking_date"
      >
        <ToggleFilterButton
          className={filterButtonClass}
          label="resources.diners.filters.inactive_30_days"
          value={inactiveSinceFilter()}
        />
      </FilterCategory>

      <FilterCategory
        icon={<UserCheck className="h-4 w-4" />}
        label="resources.diners.fields.status"
      >
        {dinerStatusChoices.map((choice) => (
          <ToggleFilterButton
            key={choice.id}
            className={filterButtonClass}
            label={<DinerStatusBadge status={choice.id} />}
            value={{ status: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Tag className="h-4 w-4" />}
        label="resources.diners.fields.tags"
      >
        {tags?.map((tag) => (
          <ToggleFilterButton
            key={tag.id}
            className={filterButtonClass}
            label={
              <span
                className="rounded-md px-1.5 py-0.5 text-xs text-black"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            }
            value={{ "tags@cs": `{${tag.id}}` }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Smartphone className="h-4 w-4" />}
        label="resources.diners.fields.signup_platform"
      >
        {platformChoices.map((choice) => (
          <ToggleFilterButton
            key={choice.id}
            className={filterButtonClass}
            label={choice.name}
            value={{ signup_platform: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Megaphone className="h-4 w-4" />}
        label="resources.diners.fields.acquisition_source"
      >
        {acquisitionSourceChoices.map((choice) => (
          <ToggleFilterButton
            key={choice.id}
            className={filterButtonClass}
            label={choice.name}
            value={{ acquisition_source: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Languages className="h-4 w-4" />}
        label="resources.diners.fields.preferred_language"
      >
        {languageChoices.map((choice) => (
          <ToggleFilterButton
            key={choice.id}
            className={filterButtonClass}
            label={choice.name}
            value={{ preferred_language: choice.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Globe className="h-4 w-4" />}
        label="resources.diners.fields.whatsapp_consent"
      >
        <ToggleFilterButton
          className={filterButtonClass}
          label="resources.diners.filters.whatsapp_opt_in"
          value={{ whatsapp_consent: true }}
        />
      </FilterCategory>
    </ResponsiveFilters>
  );
};
