FROM node:20-alpine3.18 AS builder

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine3.18

RUN apk update && \
    apk add --no-cache openssl ca-certificates coreutils

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "run", "start:prod"]
