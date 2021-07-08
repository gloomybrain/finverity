FROM node:16.4.2-alpine3.11

WORKDIR /app

COPY tsconfig.json ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install

ENV NODE_ENV=development
# sources should be mounted, see docker-compose.yml
