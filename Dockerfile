FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including dev deps like drizzle-kit)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Use pnpm run start:dev for hot-reload
CMD ["pnpm", "run", "start:dev"]