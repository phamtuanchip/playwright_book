"use strict";

// Template HTML thuần (không dùng template engine) — đủ đơn giản cho mục đích của sách:
// mọi thứ ở đây được thiết kế để có locator ổn định (label, role, id) cho Playwright test
// từ Chương 11 trở đi, không phải để làm mẫu viết backend "chuẩn".

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title, bodyHtml) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function loginPage() {
  return layout(
    "Đăng nhập",
    `
  <main class="login-page">
    <h1>Đăng nhập</h1>
    <form id="login-form" novalidate>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="username">
        <span class="field-error" id="email-error"></span>
      </div>
      <div class="field">
        <label for="password">Mật khẩu</label>
        <div class="password-wrap">
          <input id="password" name="password" type="password" autocomplete="current-password">
          <button type="button" id="toggle-password" aria-label="Hiện ký tự">👁</button>
        </div>
        <span class="field-error" id="password-error"></span>
      </div>
      <div class="server-error" id="server-error" role="alert"></div>
      <button type="submit" id="submit-btn">Đăng nhập</button>
      <p><a href="/forgot-password">Quên mật khẩu?</a></p>
    </form>
  </main>
  <script src="/login.js"></script>
  `
  );
}

function forgotPasswordPage() {
  return layout(
    "Quên mật khẩu",
    `
  <main class="forgot-password-page">
    <h1>Quên mật khẩu</h1>
    <p>Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
    <form id="forgot-password-form" novalidate>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="username">
        <span class="field-error" id="email-error"></span>
      </div>
      <div class="server-success" id="server-success" role="status"></div>
      <button type="submit" id="submit-btn">Gửi hướng dẫn</button>
    </form>
    <p><a href="/login">Quay lại đăng nhập</a></p>
  </main>
  <script src="/forgot-password.js"></script>
  `
  );
}

function dashboardPage(user) {
  return layout(
    "Dashboard",
    `
  ${navBar()}
  <main>
    <h1>Dashboard</h1>
    <p>Xin chào, <span id="username">${user.email}</span></p>
  </main>
  `
  );
}

function ordersPage(user) {
  return layout(
    "Đơn hàng",
    `
  ${navBar()}
  <main>
    <h1>Đơn hàng của bạn</h1>
    <p id="orders-empty">Chưa có đơn hàng nào.</p>
  </main>
  `
  );
}

const COUNTRIES = [
  { value: "VN", label: "Việt Nam" },
  { value: "US", label: "Hoa Kỳ" },
  { value: "JP", label: "Nhật Bản" },
];

function profilePage(user, profile) {
  const countryOptions = COUNTRIES.map(
    (c) =>
      `<option value="${c.value}"${profile.country === c.value ? " selected" : ""}>${c.label}</option>`
  ).join("\n");

  return layout(
    "Hồ sơ",
    `
  ${navBar()}
  <main class="profile-page">
    <h1>Hồ sơ</h1>
    <form id="profile-form" novalidate>
      <div class="field">
        <label for="displayName">Tên hiển thị</label>
        <input id="displayName" name="displayName" type="text" value="${escapeHtml(profile.displayName)}">
        <span class="field-error" id="displayName-error"></span>
      </div>
      <div class="field">
        <label for="bio">Giới thiệu</label>
        <textarea id="bio" name="bio">${escapeHtml(profile.bio)}</textarea>
      </div>
      <div class="field">
        <label for="country">Quốc gia</label>
        <select id="country" name="country">
          ${countryOptions}
        </select>
      </div>
      <div class="field checkbox-field">
        <label>
          <input type="checkbox" id="notifications" name="notifications"${profile.notifications ? " checked" : ""}>
          Nhận email thông báo
        </label>
      </div>
      <div class="field">
        <label for="avatar">Ảnh đại diện</label>
        <input id="avatar" name="avatar" type="file" accept="image/*">
        <span id="avatar-filename">${escapeHtml(profile.avatarFileName || "Chưa có ảnh")}</span>
      </div>
      <div class="server-error" id="server-error" role="alert"></div>
      <div class="server-success" id="server-success" role="status"></div>
      <button type="submit" id="save-btn">Lưu hồ sơ</button>
    </form>
  </main>
  <script src="/profile.js"></script>
  `
  );
}

function navBar() {
  return `<header><nav>
    <a href="/dashboard">Dashboard</a> |
    <a href="/orders">Đơn hàng</a> |
    <a href="/profile">Hồ sơ</a> |
    <a href="/logout" id="logout-link">Đăng xuất</a>
  </nav></header>`;
}

module.exports = { loginPage, forgotPasswordPage, dashboardPage, ordersPage, profilePage };
