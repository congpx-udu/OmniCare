# CLAUDE.md — Quy tắc cho AI khi làm việc trong `frontend/web`

Đây là frontend web của **OmniCare** (Trợ lý Sức khỏe Toàn diện AI). Đọc kỹ trước khi sửa code.

## 1. Bối cảnh dự án

- Sản phẩm: chatbot phân tích triệu chứng sơ bộ, OCR đơn thuốc/bệnh án in máy, gợi ý thực đơn và vận động theo thời tiết + vị trí + cảm nhận + lịch sử bệnh, dashboard nhắc uống thuốc.
- Yêu cầu nghiệp vụ nằm trong BRD (Google Docs). Ngoài phạm vi MVP: chẩn đoán chính thức, kê đơn, đặt lịch/thanh toán, OCR chữ tay, tích hợp smartwatch.
- Backend: Node/Express + MongoDB tại `../../backend`, base URL `/api` (proxy trong `vite.config.ts`).

## 2. Stack

- React 19 + TypeScript + Vite.
- Tailwind CSS v4: plugin `@tailwindcss/vite`, token màu khai báo bằng `@theme` trong `src/index.css`. **Không có** `tailwind.config.js`.
- React Router v7 (`createBrowserRouter`), Redux Toolkit + react-redux, Axios, Zod v4.
- Lint: oxlint. Format: Prettier (không dấu chấm phẩy, nháy đơn, `prettier-plugin-tailwindcss`).

## 3. Lệnh

```
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run typecheck  # tsc -b --noEmit
npm run lint       # oxlint
npm run format     # prettier src/
```

Trước khi báo hoàn thành: `npm run typecheck` và `npm run lint` phải sạch, không còn warning.

## 4. Vị trí code — đặt gì ở đâu

| Thư mục / file | Chứa gì | Ví dụ hiện có |
|---|---|---|
| `src/api/` | Tầng HTTP thô. `axiosClient.ts` (instance + interceptor gắn JWT, xử lý 401), `endpoints.ts` (hằng đường dẫn API). **Không** chứa logic nghiệp vụ. | `axiosClient.ts`, `endpoints.ts` |
| `src/services/` | Hàm gọi API theo nghiệp vụ, mỗi domain một file `xxxService.ts`. Dùng `axiosClient` + `ENDPOINTS`. Trả về dữ liệu đã có kiểu. | `authService.ts` |
| `src/redux/` | State toàn cục. `store.ts` cấu hình store, `hooks.ts` (`useAppDispatch`, `useAppSelector` đã typed), `slices/xxxSlice.ts` mỗi domain một slice. | `slices/authSlice.ts` |
| `src/context/` | React Context cho state ít thay đổi (theme, cấu hình UI). Tách **định nghĩa context** (`xxxContext.ts`) và **Provider** (`XxxProvider.tsx`) thành 2 file để Fast Refresh hoạt động. | `themeContext.ts`, `ThemeProvider.tsx` |
| `src/hooks/` | Custom hook dùng chung, file `useXxx.ts`. Hook đọc context cũng đặt ở đây. | `useAuth.ts`, `useTheme.ts`, `useGeolocation.ts` |
| `src/pages/` | Mỗi route một component trang, nhóm theo domain: `auth/`, `chat/`, `ocr/`, `health-profile/`, `dashboard/`. Tên file `XxxPage.tsx`. Trang chỉ ghép component và gọi hook, không chứa logic phức tạp. | `chat/ChatPage.tsx`, `NotFoundPage.tsx` |
| `src/layouts/` | Khung bọc ngoài trang, có `<Outlet />`. | `MainLayout.tsx` (header + nav + footer disclaimer), `AuthLayout.tsx` |
| `src/components/common/` | Component UI thuần, tái sử dụng, không gọi API. | `Button.tsx`, `Input.tsx`, `Alert.tsx`, `Logo.tsx`, `MedicalDisclaimer.tsx` |
| `src/components/<domain>/` | Component riêng của một domain (ví dụ `chat/MessageBubble.tsx`, `ocr/UploadDropzone.tsx`). Tạo thư mục khi cần. | `auth/RequireAuth.tsx`, `auth/PasswordToggle.tsx` |
| `src/constants/` | Hằng số: `routes.ts` (đường dẫn route), `storage.ts` (key localStorage), `app.ts` (tên app, disclaimer). Export gom qua `index.ts`. | `routes.ts`, `storage.ts`, `app.ts` |
| `src/types/` | Interface/type dùng chung nhiều nơi. Type chỉ dùng trong một service thì để cạnh service đó. | `user.ts`, `api.ts` |
| `src/validators/` | Zod schema cho form, export kèm `z.infer` type. | `auth.ts` |
| `src/utils/` | Hàm thuần không phụ thuộc React. | `cn.ts`, `formatDate.ts`, `apiError.ts` |
| `src/assets/` | Ảnh, icon, font. Import trực tiếp trong component. | `hero.png` |
| `src/routes.tsx` | Khai báo toàn bộ route bằng `createBrowserRouter`, dùng hằng từ `constants/routes.ts`. | |
| `src/App.tsx` | Ghép provider: Redux `Provider` → `ThemeProvider` → `RouterProvider`. | |
| `src/main.tsx` | Entry, chỉ render `<App />`. Không sửa. | |
| `src/index.css` | `@import 'tailwindcss'`, `@theme` token màu, style base. | |
| `src/App.css` | Gần như trống. Ưu tiên Tailwind, chỉ dùng khi thực sự cần CSS thuần. | |

### Luồng dữ liệu chuẩn

```
Page → hook / dispatch thunk → service → axiosClient → backend
                ↓
          redux slice / useState → Page render
```

- Cần thêm API mới: thêm path vào `api/endpoints.ts` → hàm trong `services/xxxService.ts` → gọi từ hook hoặc `createAsyncThunk` trong slice.
- Cần thêm trang mới: tạo `pages/<domain>/XxxPage.tsx` → thêm hằng vào `constants/routes.ts` → đăng ký trong `routes.tsx`.

## 5. Quy ước code

- TypeScript strict. Không dùng `any`; nếu chưa rõ kiểu, dùng `unknown` rồi thu hẹp bằng Zod.
- Function component, `export function Name()` (named export). Một component chính mỗi file, tên file PascalCase. Hook `useXxx.ts`, slice `xxxSlice.ts`, service `xxxService.ts`.
- Import bằng alias `@/`, không dùng `../../..`.
- **Không** gọi `axios`/`fetch` trực tiếp trong component hoặc page. Luôn đi qua `services/`.
- Không gọi `setState` đồng bộ trong `useEffect`. Lấy dữ liệu theo sự kiện người dùng hoặc qua thunk.
- Đăng nhập bằng **số điện thoại + mật khẩu** (không phải email). Đăng ký xong chuyển về `/login`, không tự đăng nhập. Mọi route trong `MainLayout` bọc bởi `RequireAuth`.
- State: server data và auth → Redux slice. Theme/cấu hình UI → Context. State cục bộ → `useState`.
- Validate form và response quan trọng bằng Zod, suy kiểu bằng `z.infer`.
- Styling chỉ bằng Tailwind class. Không CSS module, không styled-components. Màu thương hiệu theo design system "Clinical Clarity" (bảng trong `README.md`): `primary` (navy), `secondary` (teal), `tertiary` (sky), `neutral` (slate), mỗi màu có thang 50–900; nền `background`/`surface`/`surface-muted`; trạng thái `danger`/`warning`/`success`/`info`; font `font-heading` (Manrope) cho tiêu đề/nút, `font-sans` (Plus Jakarta Sans) cho body. Không tự thêm mã hex mới trong component.
- Không cài thư viện mới khi chưa hỏi. Không thêm UI kit (MUI, AntD).
- Text giao diện tiếng Việt có dấu. Tên biến/hàm/comment code tiếng Anh.

## 6. Quy tắc riêng cho sản phẩm y tế

- Mọi màn hình chat/gợi ý sức khỏe **bắt buộc** hiển thị `<MedicalDisclaimer />` (yêu cầu AI-04). Không xóa, không ẩn. Footer `MainLayout` cũng đã có disclaimer.
- Không hardcode lời khuyên y khoa, liều thuốc, chẩn đoán trong frontend. Nội dung y tế đến từ backend/AI.
- Dữ liệu sức khỏe là PII nhạy cảm: không `console.log`, không lưu localStorage (chỉ lưu token đăng nhập qua `STORAGE_KEYS.TOKEN`), không gửi bên thứ ba.
- Ảnh đơn thuốc/bệnh án upload qua `multipart/form-data`, không giữ base64 trong state lâu dài.
- Vị trí: dùng `useGeolocation().request()` khi người dùng bấm, luôn có fallback nhập tay thành phố.

## 7. Những điều KHÔNG làm

- Không sửa `vite.config.ts`, `tsconfig*.json`, `package.json` khi không được yêu cầu.
- Không tạo `tailwind.config.js`.
- Không commit `.env`, `.env.local` hay secret. Biến môi trường phải có tiền tố `VITE_` và liệt kê trong `.env.example`.
- Không viết lại toàn bộ file khi chỉ cần sửa vài dòng.
- Không tự ý thêm tính năng ngoài phạm vi yêu cầu.

## 8. Khi hoàn thành một task

1. Chạy `npm run typecheck && npm run lint`.
2. Tóm tắt ngắn: file đã thay đổi, quyết định đáng chú ý, việc còn dang dở.
