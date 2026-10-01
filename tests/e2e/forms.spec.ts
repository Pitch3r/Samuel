import { expect, test } from "@playwright/test";

test("contact form validates, then sends", async ({ page }) => {
  await page.goto("/contact");
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await expect(page.getByText("Please agree to the privacy notice so that we can reply.")).toBeVisible();

  await main.getByLabel("Your name").fill("Chanda Mwila");
  await main.getByLabel("Email address").fill("chanda@example.com");
  await main.getByLabel("What is your enquiry about?").selectOption("Request a proposal");
  await main.getByLabel("Your message").fill("We need a customer satisfaction survey across Lusaka and the Copperbelt.");
  await main.getByLabel(/I agree that Primeresearch/).check();
  await main.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Thank you. Your message is with us.")).toBeVisible();
  await expect(page.getByText(/PRC-\d{4}-[A-Z0-9]{5}/)).toBeVisible();
});

test("newsletter sign-up in the footer", async ({ page }) => {
  await page.goto("/about");
  const form = page.locator("footer form");
  await form.getByLabel("Email address").fill("reader@example.com");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(page.locator("footer").getByText(/You are subscribed/)).toBeVisible();
});

test("sample size calculator computes and explains results", async ({ page }) => {
  await page.goto("/tools/sample-size-calculator");
  await page.getByLabel("Margin of error value").fill("3");
  await expect(page.getByText("1,068", { exact: true }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Margin of error" }).click();
  await page.getByLabel("Completed interviews value").fill("1067");
  await expect(page.getByText("±3.0").first()).toBeVisible();

  await page.goto("/tools/sample-size-calculator?e=2&c=95");
  await expect(page.getByText("2,401", { exact: true }).first()).toBeVisible();
});

test("study finder leads into a pre-filled proposal wizard that submits", async ({ page }) => {
  const main = page.getByRole("main");
  await page.goto("/");
  await page.locator("#study-finder").scrollIntoViewIfNeeded();
  await main.getByRole("radio", { name: "Evaluate a programme" }).click();
  await expect(page.getByRole("heading", { name: "Baseline and impact evaluation" })).toBeVisible();
  await page.getByRole("link", { name: "Plan this study" }).click();
  await expect(page).toHaveURL(/start-a-project\?goal=evaluate-programme/);

  // Step 1 arrives pre-filled from the study finder.
  await expect(page.getByRole("radio", { name: "Evaluate a programme" })).toHaveAttribute("aria-checked", "true");
  await main.getByRole("button", { name: "Continue" }).click();

  // Step 2 requires a decision.
  await main.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Please describe the decision in a sentence or two.")).toBeVisible();
  await main.getByLabel("The decision").fill("Whether to scale our maternal health programme to two more districts next year.");
  await main.getByRole("button", { name: "Continue" }).click();

  // Step 3: scope.
  await main.getByRole("checkbox", { name: "Eastern" }).click();
  await main.getByRole("radio", { name: "1 to 3 months" }).click();
  await main.getByRole("radio", { name: "NGO or development partner" }).click();
  await main.getByRole("button", { name: "Continue" }).click();

  // Step 4: contact details.
  await main.getByLabel("Full name").fill("Mutale Banda");
  await main.getByLabel("Email address").fill("mutale@example.org");
  await main.getByLabel(/I agree that Primeresearch may use these details to prepare a proposal/).check();
  await main.getByRole("button", { name: "Continue" }).click();

  // Step 5: review and send.
  await expect(page.getByRole("heading", { name: "Review your brief" })).toBeVisible();
  await expect(page.getByText("Whether to scale our maternal health programme")).toBeVisible();
  await main.getByRole("button", { name: "Send my brief" }).click();
  await expect(page.getByText("Thank you. Your brief is with us.")).toBeVisible();
});

test("training enquiry pre-selects the chosen course", async ({ page }) => {
  await page.goto("/training");
  const main = page.getByRole("main");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Data analysis with SPSS" })
    .getByRole("button", { name: "Enquire about this course" })
    .click();
  await expect(main.locator("#course")).toHaveValue("data-analysis-spss");
  await main.getByLabel("Participants").fill("12");
  await main.getByRole("radio", { name: "Live online" }).click();
  await main.getByLabel("Your name").fill("Grace Phiri");
  await main.getByLabel("Email address").fill("grace@example.com");
  await main.getByLabel(/I agree that Primeresearch may use these details to respond/).check();
  await main.getByRole("button", { name: "Send training enquiry" }).click();
  await expect(page.getByText("Thank you. We will be in touch.")).toBeVisible();
});

test("field network application", async ({ page }) => {
  await page.goto("/careers");
  const main = page.getByRole("main");
  await main.getByLabel("Role you are applying for").selectOption("Enumerator / field interviewer");
  await main.getByRole("checkbox", { name: "Lusaka" }).click();
  await main.getByRole("checkbox", { name: "Nyanja" }).click();
  await main.getByLabel("Highest qualification").selectOption("Bachelor's degree");
  await main.getByLabel("Research or fieldwork experience").selectOption("1 to 3 years");
  await main.getByLabel("Tell us about your experience").fill("I have conducted household interviews on two national surveys using KoboToolbox.");
  await main.getByLabel("Full name").fill("Joseph Tembo");
  await main.getByLabel("Email address").fill("joseph@example.com");
  await main.getByLabel("Phone or WhatsApp").fill("0977 000 000");
  await main.getByLabel(/I agree that Primeresearch may keep these details/).check();
  await main.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Thank you for applying.")).toBeVisible();
});
