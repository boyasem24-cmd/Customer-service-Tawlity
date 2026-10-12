import { CreateBase, Form, useGetIdentity, useTranslate } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";

import { DEFAULT_COUNTRY } from "../tawlity/kuwait";
import { CompanyInputs } from "./CompanyInputs";

export const CompanyCreate = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  return (
    <CreateBase
      redirect="show"
      transform={(values) => {
        // add https:// before website if not present
        if (values.website && !values.website.startsWith("http")) {
          values.website = `https://${values.website}`;
        }
        return values;
      }}
    >
      <div className="mt-2 flex lg:me-72">
        <div className="flex-1">
          <Form
            defaultValues={{
              sales_id: identity?.id,
              account_status: "prospect",
              country: DEFAULT_COUNTRY,
              cuisines: [],
              is_holding: false,
              kga_member: false,
            }}
          >
            <Card>
              <CardContent>
                <CompanyInputs />
                <div
                  role="toolbar"
                  className="sticky flex pt-4 pb-4 md:pb-0 bottom-0 bg-linear-to-b from-transparent to-card to-10% flex-row justify-end gap-2"
                >
                  <CancelButton />
                  <SaveButton
                    label={translate("resources.companies.action.create", {
                      _: "Create Restaurant",
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
