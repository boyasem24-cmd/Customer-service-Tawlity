import { ResourceContextProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { buildCompany, StoryWrapper } from "@/test/StoryWrapper";
import { CompanyListMobile } from "./CompanyListMobile";

describe("CompanyListMobile", () => {
  it("lists restaurants by name, each linking to its page", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          companies: [
            buildCompany({ id: 1, name: "Sakura Sharq" }),
            buildCompany({ id: 2, name: "Beirut Corner" }),
          ],
        }}
      >
        <ResourceContextProvider value="companies">
          <CompanyListMobile />
        </ResourceContextProvider>
      </StoryWrapper>,
    );

    // sorted by name: Beirut Corner (id 2) comes first
    await expect
      .element(screen.getByRole("link").first())
      .toHaveAttribute("href", "/companies/2/show");
    await expect
      .element(screen.getByRole("link", { name: /Sakura Sharq/ }))
      .toHaveAttribute("href", "/companies/1/show");
  });
});
