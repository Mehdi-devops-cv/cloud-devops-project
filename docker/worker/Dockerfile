FROM node:22-alpine
WORKDIR /app
COPY worker/package*.json ./
RUN npm ci
COPY worker/ .
RUN mkdir -p logs
EXPOSE 9090
CMD ["node", "src/index.js"]
