import { useTranslate } from "ra-core";
import { useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DinersDashboard } from "./tawlity/DinersDashboard";
import { RestaurantsDashboard } from "./tawlity/RestaurantsDashboard";

/**
 * Two separate dashboards, one per side of the business. The active tab lives
 * in the URL (?tab=diners) so it survives a refresh and can be shared.
 */
export const Dashboard = () => {
  const translate = useTranslate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "diners" ? "diners" : "restaurants";

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
        <TabsTrigger value="diners" className="px-6">
          {translate("crm.navigation.diners_section")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="restaurants">
        <RestaurantsDashboard />
      </TabsContent>
      <TabsContent value="diners">
        <DinersDashboard />
      </TabsContent>
    </Tabs>
  );
};
