# monitor/Dockerfile

# ──────── Stage 1: install all deps ────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# installs both prod & dev deps
RUN npm ci

# ──────── Stage 2: run tests ──────────────
FROM deps AS test
WORKDIR /app
# copy app code
COPY . .
# run your unit/integration tests
RUN npm test

# ──────── Stage 3: production image ───────
FROM node:22-alpine AS release
WORKDIR /app
# install only production deps
COPY package*.json ./
RUN npm ci --omit=dev
# copy code & build artifacts
COPY . .
# expose port if desired
EXPOSE 3000
CMD ["node", "index.js"]
