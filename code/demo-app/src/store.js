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

const users = new Map();
users.set("demo@example.com", makeDemoUser());

const sessions = new Map(); // sid -> email

function resetDemoUser() {
  users.set("demo@example.com", makeDemoUser());
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

module.exports = { users, resetDemoUser, createSession, getSessionUser, destroySession };
