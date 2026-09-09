import { Page } from "@playwright/test";

// Page Object cho /forgot-password — viết bằng tay, HOÀN THIỆN từ khung nháp mà
// generate-test-skeleton.js (Chương 29) sinh ra: thêm action rõ ràng, thêm getter cho
// assertion, đúng quy tắc Page Object đã học ở Chương 15.
export class ForgotPasswordPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/forgot-password");
  }

  async requestReset(email: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByRole("button", { name: "Gửi hướng dẫn" }).click();
  }

  get emailError() {
    return this.page.locator("#email-error");
  }

  get serverSuccess() {
    return this.page.locator("#server-success");
  }
}
