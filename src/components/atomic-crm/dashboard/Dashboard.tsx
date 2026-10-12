import { useCanAccess, useGetList, useTranslate } from "ra-core";
import { useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Contact, ContactNote } from "../types";
import { DashboardStepper } from "./DashboardStepper";
import { DinersDashboard } from "./tawlity/DinersDashboard";
import { RestaurantsDashboard } from "./tawlity/RestaurantsDashboard";

/**
 * Two separate dashboards, one per side of the business. The active tab lives
 * in the URL (?tab=diners) so it survives a refresh and can be shared.
 */
export const Dashboard = () => {
  const translate = useTranslate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Diner data is for admins and the support team only
  const { canAccess: canSeeDiners } = useCanAccess({
    resource: "diners",
    action: "list",
  });
  const tab =
    canSeeDiners && searchParams.get("tab") === "diners"
      ? "diners"
      : "restaurants";

  // A brand new CRM shows the getting-started stepper instead
  const {
    data: contacts,
    total: totalContacts,
    isPending: isPendingContacts,
  } = useGetList<Contact>("contacts", { pagination: { page: 1, perPage: 1 } });
  const { total: totalContactNotes, isPending: isPendingNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });
  if (isPendingContacts || isPendingNotes) return null;
  if (!totalContacts) return <DashboardStepper step={1} />;
  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={contacts?.[0]?.id} />;
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        setSearchParams(value === "diners" ? { tab: "diners" } : {})
      }
      className="mt-2 gap-4"
    >
      <TabsList>
        <TabsTrigger value="restaurants" className="px-6">
          {translate("crm.navigation.restaurants_section")}
        </TabsTrigger>
        {canSeeDiners ? (
          <TabsTrigger value="diners" className="px-6">
            {translate("crm.navigation.diners_section")}
          </TabsTrigger>
        ) : null}
      </TabsList>
      <TabsContent value="restaurants">
        <RestaurantsDashboard />
      </TabsContent>
      {canSeeDiners ? (
        <TabsContent value="diners">
          <DinersDashboard />
        </TabsContent>
      ) : null}
    </Tabs>
  );
};
