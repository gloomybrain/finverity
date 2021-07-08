FROM node:16.4.2-alpine3.11

WORKDIR /build

COPY tsconfig.json ./
COPY .eslintrc.js ./
COPY .eslintignore ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY src/ ./src
COPY test/ ./test

RUN npm run test
RUN npm run build
RUN npm prune --production

FROM node:16.4.2-alpine3.11 as backend

WORKDIR /app

EXPOSE 80

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/node_modules/ ./node_modules
COPY --from=builder /build/dst/ ./dst

ENV NODE_ENV=production
CMD npm run start
