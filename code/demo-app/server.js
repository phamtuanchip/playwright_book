"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const {
  users,
  resetDemoUser,
  createSession,
  getSessionUser,
  destroySession,
  getProfile,
  updateProfile,
} = require("./src/store");
const { loginPage, dashboardPage, ordersPage, profilePage } = require("./src/views");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const app = express();
const LOCK_DURATION_MS = 15 * 60 * 1000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

function currentUser(req) {
  const sid = req.cookies.sid;
  return sid ? getSessionUser(sid) : null;
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) {
    return res.redirect("/login?redirect=" + encodeURIComponent(req.originalUrl));
  }
  req.user = user;
  next();
}

app.get("/", (req, res) => res.redirect(currentUser(req) ? "/dashboard" : "/login"));

app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.get("/login", (req, res) => {
  if (currentUser(req)) return res.redirect("/dashboard");
  res.send(loginPage());
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.json({ ok: false, message: "Email hoặc mật khẩu không đúng" });
  }

  const user = users.get(email);

  if (user && user.lockedUntil && user.lockedUntil > Date.now()) {
    return res.json({ ok: false, locked: true, message: "Tài khoản tạm khoá, thử lại sau 15 phút" });
  }

  if (!user || user.password !== password) {
    if (user) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = Date.now() + LOCK_DURATION_MS;
        return res.json({
          ok: false,
          locked: true,
          message: "Tài khoản tạm khoá, thử lại sau 15 phút",
        });
      }
    }
    // Không tiết lộ email có tồn tại hay không (TC-03) — cùng thông báo cho cả hai trường hợp.
    return res.json({ ok: false, message: "Email hoặc mật khẩu không đúng" });
  }

  user.failedAttempts = 0;
  const sid = createSession(user.email);
  res.cookie("sid", sid, { httpOnly: true });
  res.json({ ok: true });
});

app.get("/logout", (req, res) => {
  destroySession(req.cookies.sid);
  res.clearCookie("sid");
  res.redirect("/login");
});

app.get("/dashboard", requireAuth, (req, res) => res.send(dashboardPage(req.user)));
app.get("/orders", requireAuth, (req, res) => res.send(ordersPage(req.user)));

app.get("/profile", requireAuth, (req, res) => {
  res.send(profilePage(req.user, getProfile(req.user.email)));
});

app.post("/api/profile", requireAuth, upload.single("avatar"), (req, res) => {
  const { displayName, bio, country, notifications } = req.body;
  if (!displayName || !displayName.trim()) {
    return res.json({ ok: false, message: "Tên hiển thị là bắt buộc" });
  }

  const current = getProfile(req.user.email);
  const profile = updateProfile(req.user.email, {
    displayName: displayName.trim(),
    bio: bio || "",
    country: country || "VN",
    notifications: notifications === "on" || notifications === "true",
    avatarFileName: req.file ? req.file.originalname : current.avatarFileName,
  });
  res.json({ ok: true, profile });
});

// Chỉ phục vụ mục đích test tự động: seed lại trạng thái tài khoản demo (xoá lockout,
// reset số lần sai) để mỗi lần chạy test không phụ thuộc kết quả lần chạy trước — xem Chương 22.
app.post("/api/test/reset", (req, res) => {
  resetDemoUser();
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Demo app đang chạy tại http://localhost:${PORT}`));
}

module.exports = app;
