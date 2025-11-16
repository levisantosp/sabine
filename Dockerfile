FROM node:24.11.1-alpine

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm*.yaml .npmrc /app/
COPY . .

RUN pnpm i --frozen-lockfile
RUN pnpm build
RUN pnpm push

CMD ["pnpm", "start"]