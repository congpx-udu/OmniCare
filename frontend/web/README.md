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
│   ├── endpoints.ts      Hằng đường dẫn API (AUTH, CHAT, RECORDS, PROFILE, CONTEXT)
│   └── index.ts
├── assets/               Ảnh, icon, font
├── components/
│   ├── common/           UI tái sử dụng, không gọi API
│   │   ├── Button.tsx    5 variant theo design system (primary/secondary/inverted/outline/ghost)
│   │   ├── Input.tsx     Ô nhập có label, error, hint, rightSlot
│   │   ├── Alert.tsx     Thông báo error/success/info/warning
│   │   ├── Logo.tsx      Logo full (có chữ) hoặc mark (biểu tượng)
│   │   └── MedicalDisclaimer.tsx   Disclaimer bắt buộc trên màn hình chat/gợi ý
│   ├── auth/
│   │   ├── RequireAuth.tsx   Guard route: chưa có token → /login, đang xác minh → màn chờ
│   │   └── PasswordToggle.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx   Logo + điều hướng APP_NAV + user/đăng xuất, dùng trong AppLayout
│   │   └── NavIcon.tsx   Icon SVG nét mảnh (home, chat, scan, profile, logout, menu, close)
│   ├── landing/          Landing page "masked cards" 3 màn full-height
│   │   ├── LandingNavbar.tsx  Navbar cố định, nút Menu + hamburger, panel trượt từ phải
│   │   ├── SplashScreen.tsx   Đếm 0→100 trong 2s, chỉ hiện lần đầu mỗi phiên (sessionStorage)
│   │   ├── MaskedCard.tsx     Card hiển thị một "cửa sổ" của ảnh nền chung cả section
│   │   ├── HeroSection.tsx    Màn 1: 3 thanh + card hero (masked)
│   │   ├── FeaturesSection.tsx  Màn 2: lưới 4 card (masked) + 4 thẻ tính năng
│   │   ├── PersonasSection.tsx  Màn 3: card nền đặc + ảnh thường + 2 card đè
│   │   └── ArrowIcon.tsx
│   └── <domain>/         Component riêng từng domain (chat/, records/...), tạo khi cần
├── constants/
│   ├── app.ts            APP_NAME, MEDICAL_DISCLAIMER
│   ├── nav.ts            APP_NAV (sidebar)
│   ├── landing.ts        LANDING_IMAGES (ảnh, đang là placeholder), LANDING_MENU, HERO_BARS, FEATURE_CARDS
│   ├── routes.ts         ROUTES.HOME (landing), DASHBOARD, WEATHER, CHAT, RECORDS, PROFILE, LOGIN, REGISTER
│   ├── storage.ts        STORAGE_KEYS (key localStorage)
│   └── index.ts
├── context/
│   ├── themeContext.ts   Định nghĩa ThemeContext + type
│   └── ThemeProvider.tsx Provider theme sáng/tối
├── hooks/
│   ├── useAuth.ts        Đọc token/user từ Redux, trả isAuthenticated
│   ├── useTheme.ts       Đọc ThemeContext
│   ├── useGeolocation.ts Xin vị trí khi người dùng bấm, có error để fallback
│   ├── useIsMobile.ts    matchMedia(max-width: 767px)
│   ├── useMaskPositions.ts  Vị trí từng card so với section (ResizeObserver) cho masked cards
│   ├── useImageWidth.ts  Chiều rộng ảnh khi scale theo chiều cao section
│   └── useStaggeredReveal.ts  true khi section vào màn hình (IntersectionObserver), dùng với utils/staggerStyle
├── layouts/
│   ├── LandingLayout.tsx Công khai: header menu ngang + footer (landing, 404)
│   ├── AuthLayout.tsx    2 cột thương hiệu + form cho login/register
│   └── AppLayout.tsx     Sau đăng nhập: sidebar trái cố định (desktop), drawer + topbar (mobile)
├── pages/                Mỗi route một trang, nhóm theo domain
│   ├── landing/LandingPage.tsx   Splash + 3 section, tự cuộn tới #hash
│   ├── auth/LoginPage.tsx, RegisterPage.tsx
│   ├── dashboard/DashboardPage.tsx   Trang đầu sau đăng nhập
│   ├── chat/ChatPage.tsx
│   ├── records/RecordsPage.tsx
│   ├── health-profile/ProfilePage.tsx
│   └── NotFoundPage.tsx
├── redux/
│   ├── store.ts          configureStore, export RootState / AppDispatch
│   ├── hooks.ts          useAppDispatch / useAppSelector đã typed
│   └── slices/authSlice.ts   token, user, status, error; thunk login / register / fetchMe; logout
├── services/
│   ├── authService.ts    login(), register(), me() — gọi axiosClient theo ENDPOINTS
│   └── index.ts
├── types/
│   ├── user.ts           User
│   ├── api.ts            ApiResponse<T>
│   └── index.ts
├── validators/
│   └── auth.ts           Zod schema form login/register, chuẩn hóa số điện thoại
├── utils/
│   ├── cn.ts             Ghép className
│   ├── apiError.ts       Lấy message lỗi từ response backend
│   ├── animation.ts      staggerStyle(visible, i): hiện dần, trễ i×120ms
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
- Style chỉ bằng Tailwind. Màu thương hiệu theo design system bên dưới (khai báo trong `src/index.css`).
- Text giao diện tiếng Việt, tên biến và comment tiếng Anh.
- Mọi màn hình chat/gợi ý sức khỏe phải có `<MedicalDisclaimer />`.

Quy tắc chi tiết dành cho AI/agent nằm trong `CLAUDE.md`.

## Bố cục & điều hướng

| Khu vực | Layout | Route | Điều hướng |
|---|---|---|---|
| Landing (công khai) | `LandingLayout` | `/`, `*` | Navbar cố định: logo, nút Menu mở panel trượt (Trang chủ, Tính năng, Dành cho ai, Đăng nhập, Đăng ký); đã đăng nhập thì hiện "Vào ứng dụng" |
| Auth | `AuthLayout` | `/login`, `/register` | — |
| Ứng dụng (cần đăng nhập) | `RequireAuth` → `AppLayout` | `/dashboard`, `/weather`, `/chat`, `/records`, `/profile` | Sidebar trái 256px trên `lg`, drawer + topbar có nút menu dưới `lg` |

Thêm mục sidebar: sửa `APP_NAV` trong `constants/nav.ts` (icon phải có trong `NavIcon`). Thêm mục menu landing: sửa `LANDING_MENU` trong `constants/landing.ts`.

### Landing page "masked cards"

Ba màn full-height liền nhau (spec gốc: `docs/landingpage-requirement.md`, đã đổi nội dung và bảng màu sang OmniCare):

1. **Hero**: 3 thanh + card lớn, cùng một ảnh nền chia qua các card.
2. **Tính năng**: lưới 4 card chung ảnh nền, card cuối chứa 4 thẻ tính năng.
3. **Dành cho ai**: card nền đặc, 2 ảnh, ảnh dọc với 2 card đè.

Kỹ thuật masked cards: `useMaskPositions` đo offset từng card so với section, `useImageWidth` tính chiều rộng ảnh khi scale theo chiều cao section, `MaskedCard` đặt `background-position` âm theo offset đó nên các card ghép lại thành một ảnh liền. Ảnh được scale kiểu cover (nếu hẹp hơn section thì scale theo chiều rộng) để không hở nền ở màn hình rộng, thấp.

**Thay ảnh thật:** ghi đè file trong `src/assets/landing/` giữ nguyên tên (`hero-bg.jpg`, `features-bg.jpg` 1920×1080; `personas-bg.jpg` 1280×1600 dọc; `persona-1.jpg`, `persona-2.jpg` 900×1000), hoặc đổi đường dẫn trong `LANDING_IMAGES`. Ảnh hiện tại là gradient placeholder theo bảng màu. Chỉnh `LANDING_FOCAL` nếu chủ thể ảnh không nằm bên phải.

## Luồng xác thực

- `RegisterPage` → `POST /auth/register` `{ fullName, phone, password, email? }` → thành công thì `navigate('/login', { state: { registeredPhone } })`. Không tự đăng nhập.
- `LoginPage` → `POST /auth/login` `{ phone, password }` → lưu token vào `localStorage` (`STORAGE_KEYS.TOKEN`) → về trang trước đó (`state.from`) hoặc `/dashboard`.
- `App.tsx` có `SessionBootstrap`: khi tải trang mà có token, gọi `fetchMe` để lấy user; 401 thì xóa token.
- `RequireAuth` bọc toàn bộ route trong `AppLayout`. Landing `/` luôn công khai.
- Số điện thoại được chuẩn hóa ở cả 2 phía: `+84xxxxxxxxx` → `0xxxxxxxxx`, chấp nhận đầu 03/05/07/08/09.

## Design system — "Clinical Clarity"

Nguồn: `docs/img/chủ đạo.png`, logo trong `docs/img-des/` (đã cắt viền và copy vào `src/assets/`). Token nằm trong `@theme` của `src/index.css`, dùng như class Tailwind thường.

| Token | Hex | Dùng cho |
|---|---|---|
| `primary` (50–900, `-light`, `-dark`) | `#0B2545` | Navy: tiêu đề, nút chính, header, panel thương hiệu |
| `secondary` (50–900) | `#007A78` | Teal (màu logo): điểm nhấn, link, thành công |
| `tertiary` (50–900) | `#0284C7` | Sky: thông tin, focus ring, biểu đồ |
| `neutral` (50–900) | `#64748B` | Slate: text phụ, viền, placeholder |
| `background` / `surface` / `surface-muted` | `#EEF3FA` / `#FFFFFF` / `#E6EEF8` | Nền trang / card / khối phụ |
| `danger` / `warning` / `success` / `info` | `#B91C1C` / `#D97706` / `#007A78` / `#0284C7` | Trạng thái |
| `font-heading` | Manrope | Headline, label, nút (h1–h4 mặc định) |
| `font-sans` | Plus Jakarta Sans | Body |
| `rounded-card` | 1rem | Bo góc card |

Font nạp qua Google Fonts trong `index.html`. Ví dụ: `bg-primary text-white`, `text-secondary hover:underline`, `bg-surface-muted`, `focus:ring-tertiary/40`.

## Tài liệu liên quan

- BRD, User Personas, SRS: tài liệu Google Docs của dự án.
- Backend API: `../../backend/README.md`.
