import { useState } from "react";

// Component React tái hiện đúng hành vi "hiện/ẩn mật khẩu" của demo-app (code/demo-app —
// public/login.js, Chương 9), viết lại dưới dạng component để minh hoạ component testing.
// Trong dự án thật dùng React, đây là kiểu component sẽ được tái sử dụng ở nhiều form khác
// nhau (đăng nhập, đổi mật khẩu, đăng ký...) — nên đáng để test độc lập, không phụ thuộc
// việc phải render cả trang.

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function PasswordField({ label, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor="password-field">{label}</label>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          id="password-field"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={visible ? "Ẩn ký tự" : "Hiện ký tự"}
          onClick={() => setVisible((v) => !v)}
        >
          👁
        </button>
      </div>
    </div>
  );
}
