import { expect, test } from "@playwright/test";

const DASHES = /[–—]/;

async function sitemapPaths(request: import("@playwright/test").APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => new URL(match[1]).pathname);
}

test("every page in the sitemap renders cleanly", async ({ page, request }) => {
  test.setTimeout(300_000);
  const paths = await sitemapPaths(request);
  expect(paths.length).toBeGreaterThan(25);

  for (const path of paths) {
    const errors: string[] = [];
    const onError = (error: Error) => errors.push(error.message);
    const onConsole = (message: import("@playwright/test").ConsoleMessage) => {
      if (message.type() === "error") errors.push(message.text());
    };
    page.on("pageerror", onError);
    page.on("console", onConsole);

    const response = await page.goto(path, { waitUntil: "load" });
    expect.soft(response?.status(), path).toBe(200);
    await expect.soft(page.locator("h1").first(), path).toBeVisible();

    const { text, title, description, overflow } = await page.evaluate(() => ({
      text: document.body.innerText,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    }));
    expect.soft(DASHES.test(text), `${path} body contains a dash`).toBe(false);
    expect.soft(DASHES.test(title + description), `${path} metadata contains a dash`).toBe(false);
    expect.soft(title.length, `${path} title`).toBeGreaterThan(10);
    expect.soft(description.length, `${path} description is too short`).toBeGreaterThan(70);
    expect.soft(description.length, `${path} description is too long`).toBeLessThanOrEqual(170);
    expect.soft(overflow, `${path} scrolls horizontally`).toBeLessThanOrEqual(1);
    expect.soft(errors, `${path} console errors`).toEqual([]);

    page.off("pageerror", onError);
    page.off("console", onConsole);
  }
});

test("unknown pages show the branded 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("did not make it into the sample");
  await expect(page.getByRole("link", { name: "Back to the home page" })).toBeVisible();
});

test("search engines get a sitemap, robots rules and social images", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Sitemap:");
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.theme_color).toBe("#0B2447");
});

test("main navigation works", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Sectors" }).click();
  } else {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sectors" }).click();
  }
  await expect(page).toHaveURL(/\/sectors$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("sectors that shape Zambia");
});
