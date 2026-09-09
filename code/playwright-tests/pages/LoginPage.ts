import { Page } from "@playwright/test";

// Page Object cho /login — gói lại MỌI locator và action liên quan tới trang này vào một
// chỗ. Nếu demo app đổi cấu trúc form đăng nhập, chỉ cần sửa ở đây, không cần sửa từng
// test đang gọi tới nó (so sánh với ch11-login-test-cases.spec.ts — nơi mọi locator được
// viết trực tiếp, lặp lại y hệt ở cả 10 test).
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Mật khẩu").fill(password);
    await this.page.getByRole("button", { name: "Đăng nhập" }).click();
  }

  async loginWithEnter(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    const passwordInput = this.page.getByLabel("Mật khẩu");
    await passwordInput.fill(password);
    await passwordInput.press("Enter");
  }

  async togglePasswordVisibility() {
    await this.page.getByRole("button", { name: "Hiện ký tự" }).click();
  }

  get passwordInput() {
    return this.page.getByLabel("Mật khẩu");
  }

  get serverError() {
    return this.page.locator("#server-error");
  }

  get emailError() {
    return this.page.locator("#email-error");
  }

  get passwordError() {
    return this.page.locator("#password-error");
  }

  get submitButton() {
    return this.page.getByRole("button", { name: "Đăng nhập" });
  }
}
