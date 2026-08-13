FROM node:22-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN mkdir -p uploads logs

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
RUN mkdir -p uploads logs && chown -R appuser:appgroup /app
USER appuser
EXPOSE 8081
CMD ["node", "src/app.js"]
