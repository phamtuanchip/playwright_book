# Chương 7: Cài đặt Node.js, quản lý package, VS Code & extension hữu ích

## Mục tiêu học

- Cài đặt Node.js (bản LTS) và xác minh cài đặt thành công.
- Hiểu vai trò của npm, và vì sao sách này chọn npm làm trình quản lý package xuyên suốt.
- Cài đặt VS Code và các extension giúp việc viết Playwright test hiệu quả hơn.
- Cấu hình tối thiểu (Prettier, EditorConfig) để code nhất quán ngay từ đầu.

Chương này thuần cài đặt công cụ, không có code mẫu riêng — nhưng kết quả cài đặt ở đây là điều
kiện bắt buộc để Chương 8 (khởi tạo project Playwright) chạy được.

## 7.1. Cài đặt Node.js

Playwright Test (framework chính sách này dùng) chạy trên Node.js. Cài bản **LTS** (Long Term
Support) — ổn định, đủ mới cho Playwright, không dùng bản "Current"/thử nghiệm.

**Windows:**

```powershell
winget install OpenJS.NodeJS.LTS
```

(Hoặc tải installer `.msi` từ trang chủ Node.js, chọn bản LTS, cài như phần mềm thông thường.)

**macOS** (dùng Homebrew):

```bash
brew install node@22
```

**Linux** (Ubuntu/Debian, qua NodeSource):

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

### Xác minh cài đặt

Mở terminal mới (bắt buộc mở **mới** để nhận PATH vừa cập nhật) và chạy:

```bash
node -v    # ví dụ: v22.14.0
npm -v     # ví dụ: 10.9.2
```

Nếu lệnh báo "command not found" / "không được nhận dạng", xem mục Lỗi thường gặp bên dưới.

## 7.2. npm — trình quản lý package

**npm** (Node Package Manager) đi kèm sẵn khi cài Node.js, dùng để cài và quản lý các thư viện
(package) của project — bao gồm chính Playwright.

Có các lựa chọn thay thế phổ biến (**pnpm**, **yarn**) nhanh hơn hoặc tiết kiệm dung lượng đĩa hơn
npm trong một số trường hợp, nhưng **sách này dùng npm xuyên suốt** vì đây là lựa chọn mặc định,
không cần cài thêm gì, và là lựa chọn phổ biến nhất trong tài liệu chính thức của Playwright — phù
hợp nhất với người mới để tránh phải học thêm công cụ ngoài phạm vi sách.

Hai khái niệm cần nắm trước khi qua Chương 8:

| Lệnh | Ý nghĩa |
|---|---|
| `npm init` | Khởi tạo file `package.json` (khai báo thông tin & dependency của project) |
| `npm install <package>` | Cài một package, ghi vào `package.json` (dependency) |
| `npm install -D <package>` | Cài package chỉ dùng khi phát triển (devDependency) — Playwright thuộc nhóm này |
| `npm run <script>` | Chạy một lệnh đã khai báo trong phần `"scripts"` của `package.json` |

## 7.3. VS Code & extension hữu ích

**VS Code** (Visual Studio Code) là trình soạn thảo phổ biến nhất cho JS/TS, miễn phí, có hệ sinh
thái extension mạnh — tải tại trang chủ VS Code, cài như phần mềm thông thường.

Extension nên cài ngay từ đầu (tìm trong tab Extensions, `Ctrl+Shift+X`):

| Extension | Vai trò |
|---|---|
| **Playwright Test for VSCode** (của Microsoft) | Chạy/debug từng test ngay trong VS Code, xem Trace Viewer tích hợp (dùng nhiều từ Chương 17) |
| **ESLint** | Bắt lỗi cú pháp/logic JS-TS tiềm ẩn ngay khi gõ code |
| **Prettier - Code formatter** | Tự động format code theo một chuẩn thống nhất, tránh tranh cãi style trong team |
| **Error Lens** | Hiển thị lỗi/cảnh báo ngay trên dòng code thay vì phải mở tab Problems |

## 7.4. Cấu hình tối thiểu cho project

Hai file cấu hình nên có trong mọi project từ đầu — không bắt buộc để chạy Playwright, nhưng giúp
code nhất quán khi làm việc nhóm:

**`.editorconfig`** (thống nhất indent, line ending giữa các editor khác nhau trong team):

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

**`.prettierrc`** (cấu hình format code, cài package `prettier` qua `npm install -D prettier`):

```json
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100
}
```

Hai file này sẽ được đặt sẵn trong project Playwright khởi tạo ở Chương 8.

## Bài tập

1. Cài Node.js bản LTS theo hướng dẫn phù hợp với hệ điều hành của bạn, xác minh bằng `node -v`
   và `npm -v`.
2. Cài VS Code và 4 extension liệt kê ở mục 7.3.
3. Tạo một thư mục trống, chạy `npm init -y`, mở file `package.json` vừa sinh ra, giải thích từng
   trường (`name`, `version`, `main`, `scripts`) bằng lời của bạn.
4. Cài `prettier` vào project vừa tạo (`npm install -D prettier`), tạo file `.prettierrc` như mục
   7.4, tạo một file `test.js` cố tình format lộn xộn, chạy `npx prettier --write test.js` và quan
   sát kết quả.

## Lỗi thường gặp

- **`node` không được nhận dạng sau khi cài (Windows)**: thường do chưa mở terminal mới sau khi
  cài (PATH chỉ cập nhật cho phiên terminal mới) — đóng hẳn terminal cũ, mở lại.
- **`npm install -g` báo lỗi permission (macOS/Linux)**: không nên dùng `sudo npm install -g` (có
  thể gây lỗi quyền truy cập khó sửa về sau) — cấu hình npm dùng thư mục global riêng cho user hiện
  tại, hoặc dùng trình quản lý phiên bản Node như `nvm`.
- **Nhiều phiên bản Node cài chồng chéo, không rõ đang dùng bản nào**: chạy `node -v` để kiểm tra
  bản đang active; nếu cần nhiều phiên bản Node cho nhiều project khác nhau, cân nhắc dùng `nvm`
  (Linux/macOS) hoặc `nvm-windows`.
- **Quên mở lại VS Code sau khi cài Node**: VS Code cần khởi động lại để terminal tích hợp của nó
  nhận được PATH mới.

## Tóm tắt & tiếp theo

- Node.js (bản LTS) + npm là nền tảng bắt buộc để chạy Playwright.
- VS Code kèm extension "Playwright Test for VSCode" giúp chạy/debug test trực tiếp trong editor.
- `.editorconfig` + `.prettierrc` giúp code nhất quán ngay từ project đầu tiên.

Chương 8 sẽ dùng chính những công cụ vừa cài đặt để khởi tạo project Playwright thật đầu tiên —
`npm init playwright@latest` — và giải thích từng file mà lệnh này sinh ra.
