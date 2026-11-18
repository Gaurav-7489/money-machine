import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page, role: "Creator" | "Business" = "Creator") {
  await page.goto("/onboarding");
  await page.getByText(role, { exact: true }).click();
  await page.getByLabel(role === "Business" ? "Brand name" : "Your name").fill(role === "Business" ? "Test Brand" : "Test Creator");
  await page.getByLabel("Username").fill(role === "Business" ? "testbrand" : "testcreator");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skincare" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  if (role === "Business") {
    await page.getByRole("button", { name: "Skincare" }).click();
  } else {
    await page.getByRole("button", { name: "Brand deals" }).click();
    await page.getByRole("button", { name: "Affiliate marketing" }).click();
  }
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /show my matches/i }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test("onboarding asks for niches before continuing", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByLabel("Your name").fill("Asha");
  await page.getByLabel("Username").fill("asha.test");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Pick at least one so brands can find you.")).toBeVisible();
});

test("search finds a brand by its posts, not just its bio", async ({ page }) => {
  await onboard(page);
  await page.goto("/explore?q=skincare&mode=custom");
  const card = page.getByRole("article", { name: "Dewdrop Labs" });
  await expect(card).toBeVisible();
  await expect(card.getByText("Found in their posts:")).toBeVisible();
});

test("business: matched creators, match levels, select all and bulk DM once every 10 days", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/explore");
  await expect(page.getByText(/Showing creators for your setup/)).toBeVisible();
  await page.getByRole("radio", { name: /90%\+/ }).click();
  await expect(page).toHaveURL(/match=90/);
  await page.getByRole("radio", { name: /^All/ }).click();
  await page.getByRole("button", { name: /Select all/ }).click();
  await page.getByRole("button", { name: /Bulk DM/ }).click();
  await page.getByLabel("Minimum budget in rupees").fill("5000");
  await page.getByLabel("Maximum budget in rupees").fill("20000");
  await page.getByLabel("Note / message").fill("We'd love to send you our new serum!");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Change" }).click();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(/Bulk DM sent to/)).toBeVisible();

  await page.getByRole("button", { name: /Select all/ }).click();
  await page.getByRole("button", { name: /Bulk DM/ }).click();
  await expect(page.getByText(/Your next bulk DM unlocks in 10 days/)).toBeVisible();
});

test("search card: star and remove from results", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/explore?mode=custom");
  const card = page.getByRole("article", { name: "Kavya Fit" });
  await card.getByRole("button", { name: "Star Kavya Fit" }).click();
  await expect(page.getByText("Kavya Fit starred ⭐")).toBeVisible();
  await card.getByRole("button", { name: "Remove Kavya Fit from results" }).click();
  await expect(page.getByRole("article", { name: "Kavya Fit" })).toHaveCount(0);
  await page.getByRole("button", { name: /Restore 1 removed profile/ }).click();
  await expect(page.getByRole("article", { name: "Kavya Fit" })).toBeVisible();
  await page.goto("/saved");
  await expect(page.getByText("Kavya Fit")).toBeVisible();
});

test("creator DMs: Money Machine, founder and deal folders", async ({ page }) => {
  await onboard(page);
  await page.goto("/inbox");
  const folders = page.getByRole("region", { name: "Folders" });
  await expect(folders.getByRole("button", { name: /Money Machine/ })).toBeVisible();
  await expect(folders.getByRole("button", { name: /Zenath Sath/ })).toBeVisible();
  await folders.getByRole("button", { name: /Brand deals/ }).click();
  await expect(page.getByRole("link", { name: /FitLife/ })).toBeVisible();
  await folders.getByRole("button", { name: /Affiliate/ }).click();
  await expect(page.getByRole("link", { name: /Glow Habit/ })).toBeVisible();

  await page.goto("/inbox/t_fit");
  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText(/I'm in!/)).toBeVisible();
  await page.getByRole("button", { name: "Star this conversation" }).click();
  await page.goto("/inbox?box=starred");
  await expect(page.getByRole("link", { name: /FitLife/ })).toBeVisible();
  await page.goto("/inbox?box=sent");
  await expect(page.getByRole("link", { name: /FitLife/ })).toBeVisible();
});

test("business DMs have no founder folder", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/inbox");
  await expect(page.getByRole("region", { name: "Folders" }).getByRole("button", { name: /Zenath Sath/ })).toHaveCount(0);
});

test("feed: post a thought with a GIF, react, comment with a GIF, repost", async ({ page }) => {
  await onboard(page);
  await page.getByLabel("Write a post").fill("Hello from the e2e test #testing");
  await page.getByRole("button", { name: "Add GIF" }).click();
  await page.getByRole("button", { name: "Use GIF LET'S GO" }).click();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("Your thought is live! ✨")).toBeVisible();
  const post = page.getByRole("article").filter({ hasText: "Hello from the e2e test" });
  await expect(post.getByRole("img", { name: "GIF: LET'S GO" })).toBeVisible();

  await post.getByRole("button", { name: "React with an emoji" }).click();
  await post.getByRole("menuitem", { name: "React 🔥" }).click();
  await expect(post.getByText("You reacted")).toBeVisible();

  await post.getByRole("button", { name: "Comment" }).click();
  await post.getByLabel("Write a comment").fill("Nice one");
  await post.getByRole("button", { name: "Post comment" }).click();
  await expect(post.getByText("Nice one")).toBeVisible();

  const sample = page.getByRole("article", { name: "Post by Rohit Vlogs" });
  await sample.getByRole("button", { name: "Repost" }).click();
  await sample.getByRole("menuitem", { name: "Repost" }).click();
  await expect(page.getByText("Reposted to your profile!")).toBeVisible();
});

test("opportunities: business posts, creator applies", async ({ page }) => {
  await onboard(page, "Business");
  await page.getByRole("tab", { name: "Opportunities" }).click();
  await page.getByRole("button", { name: /Post an opportunity/ }).click();
  await page.getByLabel("Title").fill("Glow launch");
  await page.getByLabel("Details").fill("Show our serum in your routine.");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByRole("article", { name: "Glow launch" })).toBeVisible();
});

test("creator applies to an opportunity and it lands in DMs", async ({ page }) => {
  await onboard(page);
  await page.getByRole("tab", { name: "Opportunities" }).click();
  await page.getByRole("article", { name: "Winter shred campaign" }).getByRole("button", { name: "Apply now" }).click();
  await expect(page).toHaveURL(/\/inbox\//);
  await expect(page.getByText(/apply for “Winter shred campaign”/)).toBeVisible();
});

test("business sees profit, not earnings; creator sees earnings", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/money");
  await expect(page.getByRole("heading", { name: "Grow & Scale" })).toBeVisible();
  await page.getByRole("button", { name: /add investment/i }).click();
  await page.getByLabel("Description").fill("Reel with a creator");
  await page.getByLabel("Amount (₹)").fill("1000");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("tab", { name: "Scaling" }).click();
  await page.getByRole("button", { name: /add revenue/i }).click();
  await page.getByLabel("Description").fill("Website sales");
  await page.getByLabel("Amount (₹)").fill("4000");
  await page.getByRole("button", { name: "Save" }).click();
  await page.goto("/profile");
  await expect(page.getByText("Profit", { exact: true })).toBeVisible();
  await expect(page.getByText("₹3,000").first()).toBeVisible();
});

test("public profile: DM, add friend, star", async ({ page }) => {
  await onboard(page);
  await page.goto("/u/kavya.fit");
  await expect(page.getByRole("heading", { name: "Kavya Fit" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Add friend" }).click();
  await page.getByRole("button", { name: "Star Kavya Fit" }).click();
  await page.goto("/friends");
  await expect(page.getByText("Your friends (1)")).toBeVisible();
});

test("theme switch: white and dark, remembered, no flash", async ({ page }) => {
  await onboard(page);
  const sw = page.getByRole("switch", { name: "Dark theme" });
  if (await sw.isVisible()) await sw.click();
  else await page.getByRole("button", { name: "Switch to dark theme" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(13, 11, 18)");
});

test("no horizontal overflow or console errors on main pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await onboard(page);
  for (const path of ["/home", "/explore", "/explore?niche=Makeup&city=Mumbai", "/inbox", "/inbox/t_glow", "/inbox/t_mm", "/profile", "/friends", "/saved", "/notifications", "/u/glowhabit", "/money", "/affiliates", "/badges", "/create"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test("landing: editorial hero, theme toggle and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Cash out.");
  await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  const before = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button", { name: /switch to (dark|white) theme/i }).first().click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("first visit follows the device colour scheme", async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await ctx.close();
});
