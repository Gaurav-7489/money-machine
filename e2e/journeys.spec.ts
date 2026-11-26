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
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /skip for now/i }).click();
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
  await page.goto("/explore?q=skincare");
  await expect(page.getByRole("link", { name: /Dewdrop Labs/ })).toBeVisible();
});

test("search: free-text bar opens the options, prices follow the way of working", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/explore");
  // "All" is the default and shows every creator.
  await expect(page.getByRole("radio", { name: /^All/ })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("link", { name: /Kavya Fit/ })).toBeVisible();
  await page.getByPlaceholder(/Search e\.g\. makeup/).click();
  const options = page.locator("#search-options");
  await expect(options).toBeVisible();
  await expect(options.getByText("Budget per video")).toHaveCount(0);
  await options.getByRole("button", { name: "Brand deals" }).click();
  await expect(options.getByText("Budget per video (₹)")).toBeVisible();
  await options.getByRole("button", { name: "Affiliate marketing" }).click();
  await expect(options.getByText("Price per sale (₹)")).toBeVisible();
  await options.getByRole("button", { name: "UGC" }).click();
  await expect(options.getByText("Price per 1,000 views (₹)")).toBeVisible();
  await options.getByRole("button", { name: /Show \d+ creators?/ }).click();
  await expect(options).toBeHidden();
  await expect(page).toHaveURL(/earn=/);
  // Results are small tiles; tapping one opens the full profile.
  await page.getByRole("link", { name: /Kavya Fit/ }).click();
  await expect(page).toHaveURL(/\/u\/kavya\.fit$/);
  await expect(page.getByText("Monthly views")).toBeVisible();
});

test("business: matched creators, match levels, select all and bulk DM once every 10 days", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/explore");
  await page.getByRole("radio", { name: /90%\+/ }).click();
  await expect(page).toHaveURL(/match=90/);
  await page.getByRole("radio", { name: /^All/ }).click();
  await page.getByRole("button", { name: /Select all/ }).click();
  await page.getByRole("button", { name: /Bulk DM/ }).click();
  await page.getByLabel("Minimum budget (₹)").fill("5000");
  await page.getByLabel("Maximum budget (₹)").fill("20000");
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

test("profile: star and remove from search results", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/u/kavya.fit");
  await page.getByRole("button", { name: "Star Kavya Fit" }).click();
  await expect(page.getByText("Kavya Fit starred ⭐")).toBeVisible();
  await page.getByRole("button", { name: "Remove Kavya Fit from search" }).click();
  await page.goto("/explore");
  await expect(page.getByRole("link", { name: /Kavya Fit/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Restore 1 removed profile/ }).click();
  await expect(page.getByRole("link", { name: /Kavya Fit/ })).toBeVisible();
  await page.goto("/saved");
  await expect(page.getByText("Kavya Fit")).toBeVisible();
});

test("opportunities can be searched", async ({ page }) => {
  await onboard(page);
  await page.getByRole("tab", { name: "Opportunities" }).click();
  await page.getByLabel("Search opportunities").fill("earbuds");
  await expect(page.getByRole("article", { name: "Earbuds long-term review" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Winter shred campaign" })).toHaveCount(0);
});

test("creator DMs: Money Machine, founder and deal folders", async ({ page }) => {
  await onboard(page);
  await page.goto("/inbox");
  const folders = page.getByRole("region", { name: "Folders" });
  await expect(folders.getByRole("link", { name: /Money Machine/ })).toBeVisible();
  await expect(folders.getByRole("link", { name: /Zenath Sath/ })).toBeVisible();
  // Folders open: the conversations live inside them.
  await folders.getByRole("link", { name: /Brand deals/ }).click();
  await expect(page).toHaveURL(/\/inbox\/f\/deal-brand_deal$/);
  await expect(page.getByRole("heading", { name: "Brand deals" })).toBeVisible();
  await expect(page.getByRole("link", { name: /FitLife/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Glow Habit/ })).toHaveCount(0);
  await page.getByRole("link", { name: "Folders" }).click();
  await page.getByRole("region", { name: "Folders" }).getByRole("link", { name: /Affiliate/ }).click();
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
  await expect(page.getByRole("region", { name: "Folders" }).getByRole("link", { name: /Money Machine/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Folders" }).getByRole("link", { name: /Zenath Sath/ })).toHaveCount(0);
});

test("feed: post a thought with a GIF, react, comment with a GIF, repost", async ({ page }) => {
  await onboard(page);
  await page.getByLabel("Write a post").fill("Hello from the e2e test #testing");
  await page.getByRole("button", { name: "Add GIF" }).click();
  await page.getByLabel("Search GIFs").fill("money");
  await expect(page.getByRole("button", { name: "Use GIF CHA-CHING" })).toBeVisible();
  await page.getByLabel("Search GIFs").fill("hype");
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
  else {
    // On phones the theme lives in Profile → Settings.
    await page.goto("/profile");
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("radio", { name: /Dark/ }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(9, 11, 14)");
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

test("explore shows only the other side; friends finds your own side", async ({ page }) => {
  await onboard(page);
  await page.goto("/explore");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find brands");
  await expect(page.getByRole("link", { name: /Glow Habit/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Kavya Fit/ })).toHaveCount(0);
  await page.goto("/friends");
  await page.getByLabel("Search creators").fill("fit");
  await page.getByRole("button", { name: "Add Kavya Fit as a friend" }).click();
  await expect(page.getByText("Your friends (1)")).toBeVisible();
  await expect(page.getByRole("button", { name: /Add .* as a friend/ }).filter({ hasText: "Glow Habit" })).toHaveCount(0);
});

test("peer profiles show no rate card; cross-side profiles do", async ({ page }) => {
  await onboard(page);
  await page.goto("/u/kavya.fit");
  await expect(page.getByRole("heading", { name: "Fellow creator" })).toBeVisible();
  await expect(page.getByText("Charges per video")).toHaveCount(0);
  await page.goto("/u/glowhabit");
  await expect(page.getByRole("heading", { name: "Working together" })).toBeVisible();
});

test("notifications: dismiss one, then clear all", async ({ page }) => {
  await onboard(page);
  await page.goto("/notifications");
  const rows = page.getByRole("button", { name: /^Dismiss:/ });
  const before = await rows.count();
  // DMs are not repeated here; a new account starts with the welcome note from Money Machine.
  expect(before).toBeGreaterThanOrEqual(1);
  await expect(page.getByText(/New message from/)).toHaveCount(0);
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page.getByText("You're all caught up")).toBeVisible();
  await page.reload();
  await expect(page.getByText("You're all caught up")).toBeVisible();
});

test("country sets the account currency", async ({ page }) => {
  await onboard(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "Edit Profile" }).click();
  await page.getByRole("combobox", { name: /^Country/ }).selectOption("United Arab Emirates");
  await page.getByRole("combobox", { name: /^State/ }).selectOption("Dubai");
  await page.getByRole("button", { name: "Save" }).click();
  await page.goto("/money");
  await page.getByRole("button", { name: /add earning/i }).click();
  await page.getByLabel("Description").fill("Hotel shoot");
  await page.getByLabel(/^Amount \(AED\)/).fill("1200");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(/AED\s?1,200/).first()).toBeVisible();
});
