import { EditBase, Form } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { DinerInputs } from "./DinerInputs";
import { cleanupDinerForSave } from "./dinerModel";

export const DinerEdit = () => (
  <EditBase actions={false} redirect="show" transform={cleanupDinerForSave}>
    <div className="mt-2 flex gap-8">
      <Form className="flex flex-1 flex-col gap-4 pb-2">
        <Card>
          <CardContent>
            <DinerInputs />
            <FormToolbar />
          </CardContent>
        </Card>
      </Form>
    </div>
  </EditBase>
);
