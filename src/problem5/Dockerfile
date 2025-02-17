# 🏗 1. Sử dụng Node.js LTS phiên bản nhẹ
FROM node:18-alpine AS builder

# 📂 2. Set thư mục làm việc
WORKDIR /app

# 📦 3. Copy package.json và package-lock.json trước để tận dụng cache
COPY package.json package-lock.json ./
RUN npm install

# 🚀 4. Copy toàn bộ code và build TypeScript
COPY . .
RUN npm run build  # Chạy build để tạo thư mục dist/

# 🏗 5. Production stage (chạy app)
FROM node:18-alpine AS production

# 📂 6. Set thư mục làm việc
WORKDIR /app

# 📦 7. Copy dependencies từ builder nhưng chỉ giữ production dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# 🚀 8. Copy dist/ từ builder
COPY --from=builder /app/dist ./dist

# ⚙️ 9. Expose cổng chạy ứng dụng
EXPOSE 3000

# 🏁 10. Chạy ứng dụng
CMD ["node", "dist/server.js"]
