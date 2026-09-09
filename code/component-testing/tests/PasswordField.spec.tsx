import { test, expect } from "@playwright/experimental-ct-react";
import { PasswordField } from "../src/PasswordField";

// Component testing: mount() render THẲNG component React trong trình duyệt thật (không qua
// server, không có "trang" nào cả) — nhanh hơn E2E test rất nhiều vì không cần demo-app,
// không cần điều hướng, chỉ cần đúng component đang muốn kiểm tra.

test("mặc định ẩn mật khẩu, bấm nút để hiện ký tự", async ({ mount }) => {
  const component = await mount(
    <PasswordField label="Mật khẩu" value="" onChange={() => {}} />
  );

  const input = component.getByLabel("Mật khẩu");
  await expect(input).toHaveAttribute("type", "password");

  await component.getByRole("button", { name: "Hiện ký tự" }).click();
  await expect(input).toHaveAttribute("type", "text");

  await component.getByRole("button", { name: "Ẩn ký tự" }).click();
  await expect(input).toHaveAttribute("type", "password");
});

test("gọi onChange với giá trị mới khi người dùng gõ", async ({ mount }) => {
  let captured = "";
  const component = await mount(
    <PasswordField label="Mật khẩu" value="" onChange={(v) => (captured = v)} />
  );

  await component.getByLabel("Mật khẩu").fill("Password123!");
  expect(captured).toBe("Password123!");
});
