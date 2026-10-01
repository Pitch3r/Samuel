import { expect, test } from "@playwright/test";

const ADMIN = { email: "admin@example.com", password: "e2e-password-123" };

test("the dashboard is protected and manages submissions and insights", async ({ page }) => {
  // A fresh enquiry to work with.
  const created = await page.request.post("/api/contact", {
    data: {
      name: "Admin Test Visitor",
      email: "visitor@example.com",
      enquiryType: "General enquiry",
      message: "Testing the dashboard workflow end to end.",
      consent: true,
    },
  });
  expect((await created.json()).ok).toBe(true);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Email address").fill(ADMIN.email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email and password do not match.")).toBeVisible();

  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await page.getByRole("navigation", { name: "Dashboard" }).getByRole("link", { name: /Submissions/ }).click();
  await page.getByRole("link", { name: "Admin Test Visitor" }).first().click();
  await expect(page.getByRole("heading", { name: "Admin Test Visitor" })).toBeVisible();
  await page.getByText("Responded", { exact: true }).click();
  await page.getByLabel("Internal notes").fill("Replied by email.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Submission updated")).toBeVisible();

  // Export through the browser, which carries the secure session cookie.
  await page.goto("/admin");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Export CSV" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^primeresearch-submissions-\d{4}-\d{2}-\d{2}\.csv$/);
  const { readFile } = await import("node:fs/promises");
  const csv = await readFile((await download.path()) as string, "utf8");
  expect(csv).toContain("Admin Test Visitor");
  expect(csv).toContain("Replied by email.");

  // Write and publish an article, then read it on the public site.
  await page.goto("/admin/insights/new");
  await page.locator("#title").fill("A field note written in end-to-end tests");
  await page.locator("#excerpt").fill("A short summary that proves the editor can create and publish an article.");
  await page.locator("#body").fill(
    "## Why this matters\n\nThis article was written by an automated test to check that publishing works from the dashboard, and that the public page shows it straight away.\n\n- It has a list\n- And a second point",
  );
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page).toHaveURL(/\/admin\/insights\/\d+/);
  await page.getByRole("button", { name: "Update and publish" }).click();
  await expect(page.getByText("Saved and published")).toBeVisible();

  await page.goto("/insights/a-field-note-written-in-end-to-end-tests");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A field note written in end-to-end tests");
  await expect(page.getByRole("heading", { name: "Why this matters" })).toBeVisible();

  // Sign out and confirm the area is locked again.
  await page.goto("/admin");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  const locked = await page.request.get("/admin/export/submissions", { maxRedirects: 0 });
  expect([307, 401]).toContain(locked.status());
});
