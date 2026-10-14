import { addDays, subDays } from "date-fns";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import type { ContactNote, Task } from "@/components/atomic-crm/types";
import { buildCompany, buildContact, StoryWrapper } from "@/test/StoryWrapper";
import { FollowUpRow } from "./FollowUpRow";

const buildTask = (overrides: Partial<Task>): Task => ({
  id: 1,
  contact_id: 1,
  type: "call",
  text: "Call Fahad about the weekend no-shows",
  due_date: addDays(new Date(), 3).toISOString(),
  done_date: null,
  sales_id: 0,
  ...overrides,
});

const buildNote = (overrides: Partial<ContactNote>): ContactNote => ({
  id: 1,
  contact_id: 1,
  text: "",
  date: subDays(new Date(), 10).toISOString(),
  sales_id: 0,
  status: "warm",
  ...overrides,
});

const data = {
  companies: [buildCompany({ id: 1, name: "Bait Al Najdi" })],
  contacts: [
    buildContact({
      id: 1,
      first_name: "Fahad",
      last_name: "Al-Azmi",
      company_id: 1,
      company_name: "Bait Al Najdi",
    }),
  ],
  contact_notes: [
    buildNote({ id: 1, text: "Old note from the first visit." }),
    buildNote({
      id: 2,
      text: "No-show rate down to 7% since WhatsApp reminders.",
      date: subDays(new Date(), 1).toISOString(),
    }),
  ],
  tasks: [
    buildTask({
      id: 1,
      text: "Send the monthly report to Fahad",
      due_date: subDays(new Date(), 2).toISOString(),
    }),
    buildTask({ id: 2 }),
    buildTask({
      id: 3,
      text: "Already handled",
      done_date: subDays(new Date(), 1).toISOString(),
    }),
  ],
};

const renderRow = () =>
  render(
    <StoryWrapper data={data}>
      <FollowUpRow />
    </StoryWrapper>,
  );

describe("FollowUpRow", () => {
  it("counts open and overdue tasks, ignoring the ones already done", async () => {
    const screen = await renderRow();

    await expect
      .element(screen.getByRole("button", { name: /Tasks to do\s*2/ }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /Overdue tasks\s*1/ }))
      .toBeVisible();
  });

  it("shows each overdue task with the latest update on its contact", async () => {
    const screen = await renderRow();

    await screen.getByRole("button", { name: /Overdue tasks/ }).click();

    const panel = screen.getByRole("dialog");
    await expect
      .element(panel.getByText("Send the monthly report to Fahad"))
      .toBeVisible();
    await expect
      .element(
        panel.getByText("No-show rate down to 7% since WhatsApp reminders."),
      )
      .toBeVisible();
    await expect
      .element(panel.getByText("Old note from the first visit."))
      .not.toBeInTheDocument();
    await expect
      .element(panel.getByText("Call Fahad about the weekend no-shows"))
      .not.toBeInTheDocument();
  });

  it("removes a task from the counts once it is marked done", async () => {
    const screen = await renderRow();

    await screen.getByRole("button", { name: /Overdue tasks/ }).click();
    await screen
      .getByRole("dialog")
      .getByRole("button", { name: "Done" })
      .click();
    // the panel hides the page behind it while open
    await userEvent.keyboard("{Escape}");

    await expect
      .element(screen.getByRole("button", { name: /Overdue tasks\s*0/ }))
      .toBeInTheDocument();
  });
});
