import { CreateBase, Form, useTranslate } from "ra-core";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { Card, CardContent } from "@/components/ui/card";

import { DinerInputs } from "./DinerInputs";
import { cleanupDinerForSave } from "./dinerModel";

export const DinerCreate = () => {
  const translate = useTranslate();
  return (
    <CreateBase redirect="show" transform={cleanupDinerForSave}>
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <Form
            defaultValues={{
              status: "active",
              preferred_language: "ar",
              signup_date: new Date().toISOString().split("T")[0],
              total_reservations: 0,
              total_no_shows: 0,
              total_cancellations: 0,
              whatsapp_consent: false,
              favourite_restaurant_ids: [],
              tags: [],
            }}
          >
            <Card>
              <CardContent>
                <DinerInputs />
                <div
                  role="toolbar"
                  className="sticky flex pt-4 pb-4 md:pb-0 bottom-0 bg-linear-to-b from-transparent to-card to-10% flex-row justify-end gap-2"
                >
                  <CancelButton />
                  <SaveButton
                    label={translate("resources.diners.action.create")}
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
