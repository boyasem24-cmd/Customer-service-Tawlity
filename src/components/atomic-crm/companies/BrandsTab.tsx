import { Plus } from "lucide-react";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { Button } from "@/components/ui/button";
import { useListContext, useRecordContext, useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router";

import { AccountStatusBadge, ChoiceLabels } from "../tawlity/ChoiceLabel";
import { cuisineChoices, governorateChoices } from "../tawlity/choices";
import type { Company } from "../types";
import { CompanyAvatar } from "./CompanyAvatar";

/** On a holding company's page, lists the brands/branches it owns. */
export const BrandsTab = () => {
  const record = useRecordContext<Company>();
  if (!record) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-end mt-1">
        <AddBrandButton holding={record} />
      </div>
      <ReferenceManyField
        reference="companies"
        target="parent_company_id"
        sort={{ field: "name", order: "ASC" }}
        perPage={100}
      >
        <BrandsIterator />
      </ReferenceManyField>
    </div>
  );
};

const BrandsIterator = () => {
  const translate = useTranslate();
  const { data, isPending, error } = useListContext<Company>();
  if (isPending || error) return null;
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        {translate("resources.companies.no_brands")}
      </p>
    );
  }
  return (
    <div>
      {data.map((brand) => (
        <RouterLink
          key={brand.id}
          to={`/companies/${brand.id}/show`}
          className="flex items-center gap-3 hover:bg-muted py-2 px-2 transition-colors text-sm"
        >
          <CompanyAvatar record={brand} />
          <div className="flex-1 min-w-0">
            <div className="font-medium">{brand.name}</div>
            <div className="text-muted-foreground">
              <ChoiceLabels choices={cuisineChoices} values={brand.cuisines} />
              {brand.governorate ? " · " : null}
              <ChoiceLabels
                choices={governorateChoices}
                values={brand.governorate}
              />
              {brand.nb_branches
                ? ` · ${translate("resources.companies.nb_branches_short", {
                    smart_count: brand.nb_branches,
                  })}`
                : null}
            </div>
          </div>
          <AccountStatusBadge status={brand.account_status} />
        </RouterLink>
      ))}
    </div>
  );
};

const AddBrandButton = ({ holding }: { holding: Company }) => {
  const translate = useTranslate();
  return (
    <Button variant="outline" asChild size="sm" className="h-9">
      <RouterLink
        to="/companies/create"
        state={{ record: { parent_company_id: holding.id } }}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {translate("resources.companies.action.add_brand")}
      </RouterLink>
    </Button>
  );
};
