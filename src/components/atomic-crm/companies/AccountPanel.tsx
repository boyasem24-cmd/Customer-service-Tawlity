import { EditBase, Form, useRecordContext, useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { BooleanInput } from "@/components/admin/boolean-input";
import { DateInput } from "@/components/admin/date-input";
import { SaveButton } from "@/components/admin/form";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import { Progress } from "@/components/ui/progress";

import { HealthDot } from "../tawlity/HealthDot";
import {
  healthChoices,
  onboardingChecklistItems,
  planChoices,
} from "../tawlity/choices";
import { formatDateDMY, formatKWD } from "../tawlity/kuwait";
import type { Company } from "../types";

/**
 * "Account" panel on a restaurant page: contract, plan, onboarding checklist,
 * monthly reporting and (for Live restaurants) a manual health score.
 */
export const AccountPanel = () => {
  const record = useRecordContext<Company>();
  if (!record) return null;
  return (
    <EditBase
      key={record.id}
      resource="companies"
      id={record.id}
      redirect={false}
      mutationMode="pessimistic"
    >
      <Form>
        <AccountPanelInputs />
      </Form>
    </EditBase>
  );
};

const AccountPanelInputs = () => {
  const translate = useTranslate();
  const record = useRecordContext<Company>();
  const accountStatus = useWatch({ name: "account_status" });
  const checklist = useWatch({ name: "onboarding_checklist" }) ?? {};
  const monthlyFee = useWatch({ name: "monthly_fee" });
  const doneCount = onboardingChecklistItems.filter(
    (item) => checklist?.[item],
  ).length;
  const isLive = (accountStatus ?? record?.account_status) === "live";

  return (
    <div className="flex flex-col gap-6 pt-2">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput source="contract_start_date" helperText={false} />
        <DateInput source="renewal_date" helperText={false} />
        <SelectInput
          source="plan"
          choices={planChoices}
          helperText={false}
          emptyText="—"
        />
        <NumberInput
          source="monthly_fee"
          step={0.001}
          min={0}
          helperText={monthlyFee != null ? formatKWD(monthlyFee) : false}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h6 className="text-base font-semibold">
            {translate("resources.companies.account.onboarding_checklist")}
          </h6>
          <span className="text-sm text-muted-foreground">
            {doneCount}/{onboardingChecklistItems.length}
          </span>
        </div>
        <Progress
          value={(doneCount / onboardingChecklistItems.length) * 100}
          className="h-2"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pt-2">
          {onboardingChecklistItems.map((item) => (
            <BooleanInput
              key={item}
              source={`onboarding_checklist.${item}`}
              label={`resources.companies.account.checklist.${item}`}
              helperText={false}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput source="last_report_sent_at" helperText={false} />
        <div className="text-sm text-muted-foreground self-end pb-2">
          {record?.last_report_sent_at
            ? translate("resources.companies.account.last_report_on", {
                date: formatDateDMY(record.last_report_sent_at),
              })
            : translate("resources.companies.account.no_report_yet")}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h6 className="text-base font-semibold flex items-center gap-2">
          {translate("resources.companies.fields.health")}
          <HealthDot health={record?.health} />
        </h6>
        {isLive ? (
          <>
            <SelectInput
              source="health"
              choices={healthChoices}
              helperText={false}
              emptyText="—"
            />
            <TextInput
              source="health_note"
              multiline
              helperText={false}
              placeholder={translate(
                "resources.companies.account.health_note_placeholder",
              )}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {translate("resources.companies.account.health_only_live")}
          </p>
        )}
      </section>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  );
};
