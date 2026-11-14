import { expect, test } from "@playwright/test";

const QUESTIONS = 7;

test.use({ viewport: { width: 375, height: 812 } });

test.beforeEach(async ({ page }) => {
  await page.goto("/cek-kesiapan-tender");
  await page.evaluate(() => {
    localStorage.removeItem("dokumenproyek.tender-readiness.v1");
  });
  await page.reload();
});

async function answerAndContinue(
  page: import("@playwright/test").Page,
  answer: RegExp,
) {
  await page.getByRole("button", { name: answer }).click();
  await page.getByRole("button", { name: /Lanjut|Lihat hasil/ }).click();
}

test("loads the public readiness assessment without horizontal overflow", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Seberapa siap perusahaan Anda/ })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test("requires an answer before advancing", async ({ page }) => {
  await expect(page.getByText("Dimensi 1 dari 7")).toBeVisible();
  await expect(page.getByRole("button", { name: /Lanjut|Lihat hasil/ })).toBeDisabled();
  await page.getByRole("button", { name: /^Siap/ }).click();
  await expect(page.getByRole("button", { name: /Lanjut|Lihat hasil/ })).toBeEnabled();
});

test("scores a fully ready company and shares the result", async ({ page }) => {
  for (let index = 0; index < QUESTIONS; index += 1) {
    await answerAndContinue(page, /^Siap/);
  }

  await expect(page.getByText("100", { exact: true })).toBeVisible();
  await expect(page.getByText("Fondasi sudah kuat")).toBeVisible();
  const shareLink = await page.getByRole("link", { name: /Konsultasikan hasil/ }).getAttribute("href");
  expect(shareLink).toBeTruthy();
  expect(new URL(shareLink!).searchParams.get("text")).toContain("100/100");
});

test("prioritizes missing high-weight tender requirements", async ({ page }) => {
  await answerAndContinue(page, /^Belum siap/);
  await answerAndContinue(page, /^Perlu dicek/);
  for (let index = 2; index < QUESTIONS; index += 1) {
    await answerAndContinue(page, /^Siap/);
  }

  await expect(page.getByText("73", { exact: true })).toBeVisible();
  const recommendations = page.locator("main").getByText(/SBU dan klasifikasi|Personel dan SKK/);
  await expect(recommendations).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Lihat panduan" }).first()).toHaveAttribute("href", "/sbu");
});

test("keeps the completed result after a reload", async ({ page }) => {
  for (let index = 0; index < QUESTIONS; index += 1) {
    await answerAndContinue(page, /^Siap/);
  }

  await page.reload();
  await expect(page.getByText("Fondasi sudah kuat")).toBeVisible();
  await expect(page.getByText("100", { exact: true })).toBeVisible();
});
