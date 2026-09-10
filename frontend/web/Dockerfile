# OmniCare frontend — build Vite SPA rồi phục vụ bằng Nginx (multi-stage, image nhỏ)

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite đóng gói (bake) biến VITE_* vào bundle ngay lúc build, không đổi được lúc chạy container.
# Nền tảng deploy (Render/Railway) truyền env var dạng build-arg khi thấy ARG trùng tên.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: runtime (Nginx) ----
FROM nginx:1.27-alpine
# Nền tảng PaaS thường chỉ định cổng lắng nghe qua biến PORT; 8080 là mặc định khi chạy cục bộ
ENV PORT=8080
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://localhost:$PORT/health" || exit 1
