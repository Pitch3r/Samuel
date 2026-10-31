import { expect, test, type Page } from "@playwright/test";
import { ADMIN, CHANDA, admin, computer, resetDevicesAndLimits, setAccess, signIn } from "./helpers";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await resetDevicesAndLimits();
  await setAccess({ enforce: false });
});

/** The form that holds a given button, so fields with common names (note) are unambiguous. */
function formWith(page: Page, button: string) {
  return page.locator("form").filter({ has: page.getByRole("button", { name: button, exact: true }) });
}

test("an assignment goes from brief to approved work", async ({ browser }) => {
  const title = `E2E brand health study ${Date.now()}`;
  const adminPc = await computer(browser);
  const boss = await signIn(adminPc, ADMIN);

  // The administrator creates and assigns the work.
  await boss.goto("/assignments/new");
  await boss.getByLabel("Title").fill(title);
  await boss.locator("select[name=categoryId]").selectOption("market-research");
  const clientName = boss.locator("input[name=clientName]");
  if (await clientName.isVisible()) await clientName.fill("E2E Client Ltd");
  await boss.locator("label").filter({ hasText: "Chanda Mwila" }).locator("input[name=assigneeIds]").check();
  await boss.locator("input[name=dueDate]").fill("2030-12-31");
  await boss.getByRole("button", { name: "Create assignment" }).click();
  await expect(boss).toHaveURL(/\/assignments\/[A-Za-z0-9]{10,}/);
  const url = new URL(boss.url()).pathname;
  await expect(boss.getByRole("heading", { name: title })).toBeVisible();

  // The employee sees it, starts work, reports progress and submits it.
  const officePc = await computer(browser);
  const staff = await signIn(officePc, CHANDA);
  await staff.goto("/notifications");
  await expect(staff.getByText(`New assignment: ${title}`).first()).toBeVisible();
  await staff.goto(url);
  await staff.getByRole("button", { name: "Start work" }).click();
  await expect(staff.getByRole("button", { name: "Submit for review" })).toBeVisible();

  const progress = formWith(staff, "Save progress");
  await progress.getByLabel("Percent").fill("60");
  await progress.locator("textarea[name=note]").fill("Questionnaire drafted and piloted.");
  await progress.getByRole("button", { name: "Save progress" }).click();
  await expect(staff.getByText("Questionnaire drafted and piloted.").first()).toBeVisible();

  await staff.getByRole("button", { name: "Submit for review" }).click();
  await expect(staff.getByRole("button", { name: "Withdraw submission" })).toBeVisible();

  // The administrator asks for a revision, the employee resubmits, then it is approved.
  await boss.goto(url);
  const revise = formWith(boss, "Request revision");
  await revise.locator("textarea[name=note]").fill("Please add the sampling note.");
  await revise.getByRole("button", { name: "Request revision" }).click();
  await expect(boss.getByText("Please add the sampling note.").first()).toBeVisible();

  await staff.goto(url);
  await staff.getByRole("button", { name: "Resubmit for review" }).click();
  await expect(staff.getByRole("button", { name: "Withdraw submission" })).toBeVisible();

  await boss.goto(url);
  const approve = formWith(boss, "Approve and complete");
  await approve.getByLabel(/^4 out of 5/).check({ force: true });
  await approve.getByRole("button", { name: "Approve and complete" }).click();
  await expect(boss.getByText("Completed").first()).toBeVisible();

  const id = url.split("/").pop()!;
  await expect
    .poll(async () => (await admin().db.collection("assignments").doc(id).get()).data())
    .toMatchObject({ status: "completed", progress: 100, qualityRating: 4 });

  // Employees cannot change closed work.
  await staff.goto(url);
  await expect(staff.getByRole("button", { name: "Save progress" })).toHaveCount(0);

  await Promise.all([adminPc.close(), officePc.close()]);
});
