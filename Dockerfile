FROM node:18-alpine

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including dev deps like drizzle-kit)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Use pnpm run start:dev for hot-reload
CMD ["pnpm", "run", "start:dev"]