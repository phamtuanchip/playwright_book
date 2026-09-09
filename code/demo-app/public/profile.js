"use strict";

const form = document.getElementById("profile-form");
const displayNameInput = document.getElementById("displayName");
const displayNameError = document.getElementById("displayName-error");
const serverError = document.getElementById("server-error");
const serverSuccess = document.getElementById("server-success");
const avatarFilenameEl = document.getElementById("avatar-filename");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  displayNameError.textContent = "";
  serverError.textContent = "";
  serverSuccess.textContent = "";

  if (!displayNameInput.value.trim()) {
    displayNameError.textContent = "Tên hiển thị là bắt buộc";
    return;
  }

  const formData = new FormData(form);
  const res = await fetch("/api/profile", { method: "POST", body: formData });
  const data = await res.json();

  if (!data.ok) {
    serverError.textContent = data.message;
    return;
  }

  serverSuccess.textContent = "Đã lưu hồ sơ.";
  avatarFilenameEl.textContent = data.profile.avatarFileName || "Chưa có ảnh";
});
