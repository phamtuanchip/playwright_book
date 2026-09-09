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

  let data;
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    // res.ok === false khi server trả lỗi (vd 500) — thân response khi đó thường KHÔNG
    // phải JSON hợp lệ, nên phải kiểm tra res.ok TRƯỚC KHI gọi res.json(), nếu không
    // res.json() sẽ ném lỗi parse, rơi thẳng xuống catch bên dưới.
    if (!res.ok) throw new Error("http-error");
    data = await res.json();
  } catch {
    serverError.textContent = "Có lỗi xảy ra, vui lòng thử lại.";
    return;
  }

  if (data.ok) {
    window.location.href = redirect;
    return;
  }

  serverError.textContent = data.message;
  if (data.locked) {
    submitBtn.disabled = true;
  }
});
