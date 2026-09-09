"use strict";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("toggle-password");
const serverError = document.getElementById("server-error");
const submitBtn = document.getElementById("submit-btn");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

toggleBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleBtn.setAttribute("aria-label", isHidden ? "Ẩn ký tự" : "Hiện ký tự");
});

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  serverError.textContent = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  let hasError = false;

  if (!email) {
    emailError.textContent = "Email là bắt buộc";
    hasError = true;
  } else if (!EMAIL_RE.test(email)) {
    emailError.textContent = "Email không đúng định dạng";
    hasError = true;
  }

  if (!password) {
    passwordError.textContent = "Mật khẩu là bắt buộc";
    hasError = true;
  }

  if (hasError) return;

  const redirect = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (data.ok) {
    window.location.href = redirect;
    return;
  }

  serverError.textContent = data.message;
  if (data.locked) {
    submitBtn.disabled = true;
  }
});
