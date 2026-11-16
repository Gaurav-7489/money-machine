import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page, role: "Creator" | "Business" = "Creator") {
  await page.goto("/onboarding");
  await page.getByText(role, { exact: true }).click();
  await page.getByLabel(role === "Business" ? "Brand name" : "Your name").fill(role === "Business" ? "Test Brand" : "Test Creator");
  await page.getByLabel("Username").fill(role === "Business" ? "testbrand" : "testcreator");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

async function openFilters(page: Page) {
  const toggle = page.getByRole("button", { name: "Show filters" });
  if (await toggle.isVisible()) await toggle.click();
}

test("search: filter, match %, select, save and clear", async ({ page }) => {
  await onboard(page, "Business");
  await page.goto("/explore");
  await openFilters(page);
  await page.getByLabel("Category").selectOption("Fitness");
  await page.getByRole("button", { name: "Search matches" }).click();
  await expect(page).toHaveURL(/category=Fitness/);
  await expect(page.getByRole("article", { name: "Kavya Fit" }).getByText("Perfect match")).toBeVisible();

  await page.getByLabel("Minimum match").selectOption("90");
  await expect(page.getByRole("article")).toHaveCount(2);

  await page.getByRole("button", { name: "Select all" }).click();
  await expect(page.getByText("2 selected")).toBeVisible();
  await page.getByRole("button", { name: "Save selected" }).click();
  await expect(page.getByText("2 profiles saved successfully!")).toBeVisible();
  await page.getByRole("button", { name: "Deselect all" }).first().click();
  await expect(page.getByText("2 selected")).toBeHidden();

  await openFilters(page);
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page).not.toHaveURL(/category=/);
  await expect(page.getByRole("article")).toHaveCount(6);

  await page.goto("/saved");
  await expect(page.getByText("Kavya Fit")).toBeVisible();
  await expect(page.getByText("FitLife")).toBeVisible();
});

test("search: no matches message and social handle search", async ({ page }) => {
  await onboard(page);
  await page.goto("/explore?social=nobody_here");
  await expect(page.getByText("No matches found. Try changing your filters.")).toBeVisible();
  await page.goto("/explore?social=%40glowhabit");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("article").getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Business saved successfully!")).toBeVisible();
});

test("feed: publish, comment, like and delete a post", async ({ page }) => {
  await onboard(page);
  await page.getByLabel("Write a post").fill("Hello from the e2e test #testing");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Your post is live!")).toBeVisible();
  const post = page.getByRole("article").filter({ hasText: "Hello from the e2e test" });
  await expect(post).toBeVisible();

  await post.getByRole("button", { name: "Like" }).click();
  await expect(post.getByText("1 like", { exact: true })).toBeVisible();
  await post.getByRole("button", { name: "Comment", exact: true }).click();
  await post.getByLabel("Write a comment").fill("Nice one");
  await post.getByRole("button", { name: "Post", exact: true }).click();
  await expect(post.getByText("Nice one")).toBeVisible();

  await page.getByRole("tab", { name: "Businesses" }).click();
  await expect(page.getByRole("article").filter({ hasText: "Hello from the e2e test" })).toHaveCount(0);
  await page.getByRole("tab", { name: "All" }).click();

  await post.getByRole("button", { name: "Delete post" }).click();
  await page.getByRole("button", { name: "Delete post" }).last().click();
  await expect(page.getByRole("article").filter({ hasText: "Hello from the e2e test" })).toHaveCount(0);
});

test("messages: message from search, star, trash and restore", async ({ page }) => {
  await onboard(page);
  await page.goto("/explore?q=rohit");
  await page.getByRole("article", { name: "Rohit Vlogs" }).getByRole("button", { name: "Message" }).click();
  await expect(page).toHaveURL(/\/inbox\//);
  await page.getByLabel("Write a message to Rohit Vlogs").fill("Hi Rohit!");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Hi Rohit!")).toBeVisible();
  await expect(page.getByText(/Sent · (just now|\d+m ago)/)).toBeVisible();

  await page.getByRole("button", { name: "Star this conversation" }).click();
  await page.goto("/inbox?folder=starred");
  await expect(page.getByRole("link", { name: /Rohit Vlogs/ })).toBeVisible();
  await page.goto("/inbox?folder=sent");
  await expect(page.getByText("You: Hi Rohit!")).toBeVisible();

  await page.getByRole("link", { name: /Rohit Vlogs/ }).click();
  await page.getByRole("button", { name: "Move to Trash" }).click();
  await page.getByRole("button", { name: "Move to Trash" }).last().click();
  await page.goto("/inbox?folder=trash");
  await page.getByRole("button", { name: "Restore conversation with Rohit Vlogs" }).click();
  await expect(page.getByText("Trash is empty")).toBeVisible();
});

test("public profile and follow → friends", async ({ page }) => {
  await onboard(page);
  await page.goto("/u/kavya.fit");
  await expect(page.getByRole("heading", { name: "Kavya Fit" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Follow" }).click();
  await page.goto("/friends");
  await expect(page.getByText("You follow (1)")).toBeVisible();
});

test("profile: edit details and see them", async ({ page }) => {
  await onboard(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "Edit Profile" }).click();
  await page.getByLabel("Bio").fill("I make fitness videos.");
  await page.getByLabel("Category").selectOption("Fitness");
  await page.getByLabel("Public email").fill("not-an-email");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Enter a valid email, like name@example.com")).toBeVisible();
  await page.getByLabel("Public email").fill("");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Profile saved!")).toBeVisible();
  await expect(page.getByText("I make fitness videos.")).toBeVisible();
});

test("theme switch toggles dark mode and remembers it", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: /switch to dark mode|dark mode/i }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("no horizontal overflow or console errors on main pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await onboard(page);
  for (const path of ["/home", "/explore", "/explore?category=Beauty&city=Mumbai", "/inbox", "/inbox/t_glow", "/profile", "/friends", "/saved", "/notifications", "/u/glowhabit", "/money", "/affiliates", "/badges", "/create"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test("help tips open on click or tap", async ({ page }) => {
  await onboard(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "What does this mean?" }).first().click();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toBeHidden();
  await page.getByRole("button", { name: "What does this mean?" }).first().click();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.locator("main").click({ position: { x: 4, y: 4 } });
  await expect(page.getByRole("tooltip")).toBeHidden();
});
