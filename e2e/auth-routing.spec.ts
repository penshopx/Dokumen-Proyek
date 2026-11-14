import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/config", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ google: false, email: true, whatsapp: false }),
    }),
  );
  await page.route("**/api/auth/user", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
  );
});

test("primary and legacy login routes both reach the OTP login page", async ({ page }) => {
  for (const path of ["/login", "/auth"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Masuk ke akun Anda" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk dengan Email OTP" })).toBeVisible();
  }
});
