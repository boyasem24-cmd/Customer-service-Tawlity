import { ChevronRight } from "lucide-react";
import {
  InfiniteListBase,
  RecordContextProvider,
  useListContext,
  useTranslate,
} from "ra-core";
import { Link } from "react-router";

import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { InfinitePagination } from "../misc/InfinitePagination";
import { AccountStatusBadge, ChoiceLabels } from "../tawlity/ChoiceLabel";
import { cuisineChoices, governorateChoices } from "../tawlity/choices";
import { HealthDot } from "../tawlity/HealthDot";
import type { Company } from "../types";
import { CompanyAvatar } from "./CompanyAvatar";

/** Restaurant list for phones: one tappable row per restaurant. */
export const CompanyListMobile = () => (
  <InfiniteListBase perPage={25} sort={{ field: "name", order: "ASC" }}>
    <CompanyListLayoutMobile />
  </InfiniteListBase>
);

const CompanyListLayoutMobile = () => {
  const translate = useTranslate();
  const { data, error, isPending } = useListContext<Company>();

  return (
    <div>
      <MobileHeader showRefresh>
        <h1 className="text-xl font-semibold">
          {translate("resources.companies.name", { smart_count: 2 })}
        </h1>
      </MobileHeader>
      <MobileContent>
        {isPending || error ? null : (
          <ul className="flex flex-col divide-y">
            {data.map((company) => (
              <RecordContextProvider key={company.id} value={company}>
                <CompanyRowMobile company={company} />
              </RecordContextProvider>
            ))}
          </ul>
        )}
        {!error && (
          <div className="flex justify-center">
            <InfinitePagination />
          </div>
        )}
      </MobileContent>
    </div>
  );
};

const CompanyRowMobile = ({ company }: { company: Company }) => {
  const translate = useTranslate();
  return (
    <li>
      <Link
        to={`/companies/${company.id}/show`}
        className="flex items-center gap-3 py-3"
      >
        <CompanyAvatar />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{company.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {company.is_holding ? (
              translate("resources.companies.holding_company")
            ) : (
              <ChoiceLabels
                choices={cuisineChoices}
                values={company.cuisines}
              />
            )}
            {company.governorate ? " · " : null}
            <ChoiceLabels
              choices={governorateChoices}
              values={company.governorate}
            />
          </div>
          <div className="mt-1 flex items-center gap-1">
            <AccountStatusBadge status={company.account_status} />
            {company.account_status === "live" ? (
              <HealthDot health={company.health} note={company.health_note} />
            ) : null}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
      </Link>
    </li>
  );
};
