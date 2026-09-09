import { Page } from "@playwright/test";

export class ProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/profile");
  }

  async fillDisplayName(value: string) {
    await this.page.getByLabel("Tên hiển thị").fill(value);
  }

  async fillBio(value: string) {
    await this.page.getByLabel("Giới thiệu").fill(value);
  }

  async selectCountry(value: string) {
    await this.page.getByLabel("Quốc gia").selectOption(value);
  }

  async setNotifications(enabled: boolean) {
    const checkbox = this.page.getByLabel("Nhận email thông báo");
    if (enabled) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async uploadAvatar(filePath: string) {
    await this.page.getByLabel("Ảnh đại diện").setInputFiles(filePath);
  }

  async save() {
    await this.page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  }

  get displayNameInput() {
    return this.page.getByLabel("Tên hiển thị");
  }

  get displayNameError() {
    return this.page.locator("#displayName-error");
  }

  get serverSuccess() {
    return this.page.locator("#server-success");
  }
}
