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

module.exports = {
  users,
  resetDemoUser,
  createSession,
  getSessionUser,
  destroySession,
  getProfile,
  updateProfile,
};
