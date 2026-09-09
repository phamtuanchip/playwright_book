"use strict";

const crypto = require("crypto");

// "Database" trong bộ nhớ — đủ dùng cho mục đích demo/test, KHÔNG dùng cho production
// (mất dữ liệu khi restart server, không chia sẻ được giữa nhiều tiến trình).

function makeDemoUser() {
  return {
    email: "demo@example.com",
    password: "Password123!",
    failedAttempts: 0,
    lockedUntil: null,
  };
}

function makeDemoProfile() {
  return {
    displayName: "demo",
    bio: "",
    country: "VN",
    notifications: false,
    avatarFileName: null,
  };
}

const users = new Map();
users.set("demo@example.com", makeDemoUser());

const profiles = new Map(); // email -> profile
profiles.set("demo@example.com", makeDemoProfile());

const sessions = new Map(); // sid -> email

function resetDemoUser() {
  users.set("demo@example.com", makeDemoUser());
  profiles.set("demo@example.com", makeDemoProfile());
}

function createSession(email) {
  const sid = crypto.randomBytes(16).toString("hex");
  sessions.set(sid, email);
  return sid;
}

function getSessionUser(sid) {
  const email = sessions.get(sid);
  return email ? users.get(email) : null;
}

function destroySession(sid) {
  sessions.delete(sid);
}

function getProfile(email) {
  if (!profiles.has(email)) {
    profiles.set(email, makeDemoProfile());
  }
  return profiles.get(email);
}

function updateProfile(email, patch) {
  const current = getProfile(email);
  const updated = { ...current, ...patch };
  profiles.set(email, updated);
  return updated;
}

// Chỉ dùng cho test tự động: đặt trực tiếp số lần đăng nhập sai của một tài khoản, để test
// TC-07 (khoá tài khoản) không cần thực sự đăng nhập sai 4 lần trước đó qua UI/API — seed
// thẳng trạng thái cần test. Xem Chương 22.
function setFailedAttempts(email, count) {
  const user = users.get(email);
  if (!user) return null;
  user.failedAttempts = count;
  user.lockedUntil = null;
  return user;
}

// Chỉ dùng cho test tự động: tạo một tài khoản MỚI, độc lập với tài khoản demo chung — nền
// tảng để chạy test song song an toàn (mỗi worker seed tài khoản riêng, không đụng tài khoản
// của worker khác). Xem Chương 23.
function createUser(email, password) {
  const user = { email, password, failedAttempts: 0, lockedUntil: null };
  users.set(email, user);
  return user;
}

module.exports = {
  users,
  resetDemoUser,
  createSession,
  getSessionUser,
  destroySession,
  getProfile,
  updateProfile,
  setFailedAttempts,
  createUser,
};
