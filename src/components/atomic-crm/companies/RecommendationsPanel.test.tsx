import { subDays } from "date-fns";
import { RecordContextProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import type { Company } from "@/components/atomic-crm/types";
import {
  buildCompany,
  buildContact,
  buildDeal,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { RecommendationsPanel } from "./RecommendationsPanel";

const restaurant = buildCompany({
  id: 1,
  name: "Bait Al Najdi",
  account_status: "prospect",
});

const data = {
  companies: [restaurant],
  contacts: [
    buildContact({
      id: 1,
      first_name: "Fahad",
      company_id: 1,
      is_decision_maker: true,
    }),
  ],
  deals: [
    buildDeal({
      company_id: 1,
      stage: "visited",
      updated_at: subDays(new Date(), 1).toISOString(),
    }),
  ],
};

const renderPanel = (record: Company = restaurant) =>
  render(
    <StoryWrapper data={data}>
      <RecordContextProvider value={record}>
        <RecommendationsPanel />
      </RecordContextProvider>
    </StoryWrapper>,
  );

describe("RecommendationsPanel", () => {
  it("shows the next action for the restaurant with its reason", async () => {
    const screen = await renderPanel();

    await expect
      .element(screen.getByText("Book a demo with the owner"))
      .toBeVisible();
    await expect
      .element(
        screen.getByText(
          "The restaurant was visited but has not seen a demo yet.",
        ),
      )
      .toBeVisible();
  });

  it("turns a recommendation into a task and then shows it as planned", async () => {
    const screen = await renderPanel();

    await screen.getByRole("button", { name: "Create task" }).click();

    await expect
      .element(screen.getByText("Task created for Fahad"))
      .toBeVisible();
    await expect
      .element(screen.getByText("Task already planned"))
      .toBeVisible();
  });

  it("asks for a contact before a task can be created", async () => {
    const screen = await render(
      <StoryWrapper data={{ companies: [restaurant] }}>
        <RecordContextProvider value={restaurant}>
          <RecommendationsPanel />
        </RecordContextProvider>
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText("Find the right person to talk to"))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Create task" }).first())
      .toBeDisabled();
  });
});
