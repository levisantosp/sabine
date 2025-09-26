FROM node:lts-alpine

RUN npm i -g pnpm

WORKDIR /app

COPY package*.json /app
COPY . .

RUN pnpm i
RUN pnpm build
RUN pnpm push

CMD ["pnpm", "start"]