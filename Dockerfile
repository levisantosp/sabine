FROM oven/bun:1.3.2-alpine

WORKDIR /app

COPY package.json bun.lock /app/
COPY . .

RUN bun i --frozen-lockfile
RUN bun compile
RUN bun push

CMD ["bun", "start"]