import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page, role: "Creator" | "Business" = "Creator") {
  await page.goto("/");
  await page.getByRole("link", { name: /get started/i }).first().click();
  await page.getByText(role, { exact: true }).click();
  await page.getByLabel(role === "Business" ? "Brand name" : "Your name").fill(role === "Business" ? "Test Brand" : "Test Creator");
  await page.getByLabel("Username").fill(role === "Business" ? "testbrand" : "testcreator");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test("manifest is installable-shaped", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m.display).toBe("standalone");
  expect(m.icons.some((i: { sizes: string }) => i.sizes === "512x512")).toBeTruthy();
});

test("onboarding validates input", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter your name")).toBeVisible();
});

test("creator can record income and earn a badge", async ({ page }) => {
  await onboard(page);
  await page.goto("/money");
  await expect(page.getByText("No income recorded yet")).toBeVisible();
  await page.getByRole("button", { name: /add income/i }).click();
  await page.getByLabel("Description").fill("Skincare collab");
  await page.getByLabel("Amount (₹)").fill("2500");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Skincare collab")).toBeVisible();
  await expect(page.getByText("₹2,500").first()).toBeVisible();
  await page.goto("/badges");
  await expect(page.getByText("1 of 6 earned")).toBeVisible();
});

test("business can publish an affiliate program", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/affiliates/new");
  await page.getByLabel("Program name").fill("Test Brand Affiliate");
  await page.getByLabel("Description").fill("Promote our products to your audience.");
  await page.getByLabel("Terms").fill("Commission on confirmed sales only.");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page).toHaveURL(/\/affiliates$/);
  await expect(page.getByText("Test Brand Affiliate")).toBeVisible();
});

test("app pages redirect to welcome without a profile", async ({ page }) => {
  await page.goto("/money");
  await expect(page).toHaveURL(/\/$/);
});
