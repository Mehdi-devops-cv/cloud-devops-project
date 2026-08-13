FROM node:22-alpine
WORKDIR /app
COPY database/seed/package*.json ./
RUN npm ci
COPY database/seed/ .
CMD ["node", "seed.js"]
