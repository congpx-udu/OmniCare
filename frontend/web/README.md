# OmniCare — Frontend Web

Giao diện web của **OmniCare – Trợ lý Sức khỏe Toàn diện AI**: chatbot phân tích triệu chứng sơ bộ, số hóa đơn thuốc/bệnh án bằng OCR, gợi ý thực đơn và vận động theo thời tiết, vị trí và cảm nhận của người dùng, cùng dashboard nhắc uống thuốc.

> ⚠️ OmniCare không thay thế chẩn đoán y khoa.

## Công nghệ

| Thành phần | Lựa chọn |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v7 |
| State toàn cục | Redux Toolkit + react-redux |
| State UI nhẹ | React Context |
| Validation | Zod v4 |
| HTTP | Axios |
| Lint / Format | oxlint, Prettier + `prettier-plugin-tailwindcss` |

## Yêu cầu

- Node.js ≥ 20 (đang dùng 22)
- npm ≥ 10
- Backend Express chạy tại `http://localhost:3000` (xem `../../backend`)

## Bắt đầu

```bash
cd frontend/web
npm install
cp .env.example .env.local     # chỉnh VITE_API_URL nếu backend không ở localhost:3000
npm run dev                    # http://localhost:5173
```

Trong lúc dev, mọi request tới `/api/*` được Vite proxy sang backend nên không gặp CORS.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Dev server có HMR |
| `npm run build` | Kiểm tra type rồi build vào `dist/` |
| `npm run preview` | Xem thử bản build |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | oxlint |
| `npm run format` | Prettier toàn bộ `src/` |

## Cấu trúc thư mục

```
src/
├── api/                  Tầng HTTP thô
│   ├── axiosClient.ts    Axios instance, interceptor gắn JWT, xử lý 401
│   ├── endpoints.ts      Hằng đường dẫn API (AUTH, CHAT, OCR, PROFILE, CONTEXT)
│   └── index.ts
├── assets/               Ảnh, icon, font
├── components/
│   ├── common/           UI tái sử dụng, không gọi API
│   │   ├── Button.tsx
│   │   └── MedicalDisclaimer.tsx   Disclaimer bắt buộc trên màn hình chat/gợi ý
│   └── <domain>/         Component riêng từng domain (chat/, ocr/...), tạo khi cần
├── constants/
│   ├── app.ts            APP_NAME, MEDICAL_DISCLAIMER
│   ├── routes.ts         ROUTES.HOME, ROUTES.CHAT, ...
│   ├── storage.ts        STORAGE_KEYS (key localStorage)
│   └── index.ts
├── context/
│   ├── themeContext.ts   Định nghĩa ThemeContext + type
│   └── ThemeProvider.tsx Provider theme sáng/tối
├── hooks/
│   ├── useAuth.ts        Đọc token/user từ Redux, trả isAuthenticated
│   ├── useTheme.ts       Đọc ThemeContext
│   └── useGeolocation.ts Xin vị trí khi người dùng bấm, có error để fallback
├── layouts/
│   ├── MainLayout.tsx    Header + nav + footer disclaimer, bọc các trang chính
│   └── AuthLayout.tsx    Khung giữa màn hình cho login/register
├── pages/                Mỗi route một trang, nhóm theo domain
│   ├── auth/LoginPage.tsx
│   ├── chat/ChatPage.tsx
│   ├── ocr/OcrPage.tsx
│   ├── health-profile/ProfilePage.tsx
│   ├── dashboard/HomePage.tsx, DashboardPage.tsx
│   └── NotFoundPage.tsx
├── redux/
│   ├── store.ts          configureStore, export RootState / AppDispatch
│   ├── hooks.ts          useAppDispatch / useAppSelector đã typed
│   └── slices/authSlice.ts   token + user, setCredentials / logout
├── services/
│   ├── authService.ts    login(), me() — gọi axiosClient theo ENDPOINTS
│   └── index.ts
├── types/
│   ├── user.ts           User
│   ├── api.ts            ApiResponse<T>
│   └── index.ts
├── utils/
│   ├── cn.ts             Ghép className
│   ├── formatDate.ts
│   └── index.ts
├── routes.tsx            createBrowserRouter, khai báo toàn bộ route
├── App.tsx               Redux Provider → ThemeProvider → RouterProvider
├── App.css               Gần như trống, ưu tiên Tailwind
├── index.css             @import tailwindcss + @theme token màu
└── main.tsx              Entry
```

### Luồng dữ liệu

```
Page → hook / thunk → services/ → api/axiosClient → backend
              ↓
        redux slice / useState → Page render
```

### Thêm một API mới

1. Thêm path vào `src/api/endpoints.ts`.
2. Viết hàm trong `src/services/<domain>Service.ts`.
3. Gọi từ hook hoặc `createAsyncThunk` trong `src/redux/slices/<domain>Slice.ts`.

### Thêm một trang mới

1. Tạo `src/pages/<domain>/XxxPage.tsx`.
2. Thêm hằng vào `src/constants/routes.ts`.
3. Đăng ký trong `src/routes.tsx` dưới layout phù hợp.

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `VITE_API_URL` | `/api` | Base URL của backend |

Chỉ biến có tiền tố `VITE_` mới được đưa vào bundle. Không commit `.env` hoặc `.env.local`.

## Quy ước

- Alias import `@/` trỏ tới `src/`.
- Không gọi axios/fetch trong component. Luôn đi qua `services/`.
- Style chỉ bằng Tailwind. Màu thương hiệu: `primary`, `primary-dark`, `primary-light`, `danger`, `warning`, `success` (khai báo trong `src/index.css`).
- Text giao diện tiếng Việt, tên biến và comment tiếng Anh.
- Mọi màn hình chat/gợi ý sức khỏe phải có `<MedicalDisclaimer />`.

Quy tắc chi tiết dành cho AI/agent nằm trong `CLAUDE.md`.

## Tài liệu liên quan

- BRD, User Personas, SRS: tài liệu Google Docs của dự án.
- Backend API: `../../backend/README.md`.
