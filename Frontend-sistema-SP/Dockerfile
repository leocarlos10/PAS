FROM oven/bun:latest AS build

WORKDIR /app

ARG VITE_API_URL
ARG VITE_CRYPTO_SECRET_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CRYPTO_SECRET_KEY=$VITE_CRYPTO_SECRET_KEY

COPY bun.lock package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:1.27-alpine

ARG NGINX_SERVER_NAME=_
ENV NGINX_SERVER_NAME=$NGINX_SERVER_NAME

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

