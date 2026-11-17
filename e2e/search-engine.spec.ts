import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page) {
  await page.goto("/onboarding");
  await page.getByText("Creator", { exact: true }).click();
  await page.getByLabel("Your name").fill("Test Creator");
  await page.getByLabel("Username").fill("testcreator");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

async function openFilters(page: Page) {
  const toggle = page.getByRole("button", { name: "Show filters" });
  if (await toggle.isVisible()) await toggle.click();
}

test("search engine: business switch + what are you looking for + means of earning", async ({ page }) => {
  await onboard(page);
  await page.goto("/explore");
  await openFilters(page);
  await page.getByRole("radio", { name: "Business" }).click();
  await page.getByPlaceholder("Makeup, fitness, home decor").fill("fitness");
  await page.getByLabel("Means of earning").selectOption("affiliate");
  await page.getByRole("button", { name: "Search matches" }).click();
  await expect(page).toHaveURL(/looking=fitness/);
  await expect(page).toHaveURL(/type=business/);
  await expect(page).toHaveURL(/earn=affiliate/);
  const first = page.getByRole("article").first();
  await expect(first).toHaveAccessibleName("FitLife");
});

test("search engine: handle field and discovery category card", async ({ page }) => {
  await onboard(page);
  await page.goto("/explore");
  await page.getByRole("region", { name: "Browse niches" }).getByRole("button", { name: /Travel/ }).click();
  await expect(page).toHaveURL(/category=Travel/);
  await openFilters(page);
  await page.getByPlaceholder("@handle").fill("@rohitvlogs");
  await page.getByRole("button", { name: "Search matches" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("feed: account mode switch keeps the session", async ({ page }) => {
  await onboard(page);
  await page.getByRole("radio", { name: "Business" }).click();
  await expect(page.getByText("Switched to Business mode")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Business" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: "Creator" }).click();
  await expect(page.getByRole("radio", { name: "Creator" })).toHaveAttribute("aria-checked", "true");
});
