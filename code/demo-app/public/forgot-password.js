"use strict";

const form = document.getElementById("forgot-password-form");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const serverSuccess = document.getElementById("server-success");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  emailError.textContent = "";
  serverSuccess.textContent = "";

  const email = emailInput.value.trim();
  if (!email) {
    emailError.textContent = "Email là bắt buộc";
    return;
  }
  if (!EMAIL_RE.test(email)) {
    emailError.textContent = "Email không đúng định dạng";
    return;
  }

  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  serverSuccess.textContent = data.message;
});
