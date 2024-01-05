import { test, expect } from "@playwright/test";

for (const template of ["react", "es6", "solid", "vue", "elm"]) {
  test(`renders ${template}`, async ({ page }) => {
    await page.goto(
      `http://localhost:3000/base-component-${template}/1.0.0/~preview?userId=1`
    );

    await expect(
      page.getByRole("button", { name: "Fun year fact" })
    ).toBeVisible();

    await expect(page).toHaveScreenshot("initial.png");

    await page.getByRole("button", { name: "Fun year fact" }).click();

    await expect(page).toHaveScreenshot("fun-fact.png");
  });
}
