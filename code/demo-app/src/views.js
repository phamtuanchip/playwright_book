"use strict";

// Template HTML thuần (không dùng template engine) — đủ đơn giản cho mục đích của sách:
// mọi thứ ở đây được thiết kế để có locator ổn định (label, role, id) cho Playwright test
// từ Chương 11 trở đi, không phải để làm mẫu viết backend "chuẩn".

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
    </form>
  </main>
  <script src="/login.js"></script>
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

function navBar() {
  return `<header><nav>
    <a href="/dashboard">Dashboard</a> |
    <a href="/orders">Đơn hàng</a> |
    <a href="/logout" id="logout-link">Đăng xuất</a>
  </nav></header>`;
}

module.exports = { loginPage, dashboardPage, ordersPage };
