FROM node:8.4-alpine 
LABEL maintainer Daniel Olivares "daniel.olivares@parkhub.com"

RUN apk add --update --upgrade --no-cache git
RUN mkdir /npm-module
WORKDIR /npm-module

RUN apk --update --upgrade add \
  cyrus-sasl-dev \
  make \
  gcc \
  g++ \
  bash \
  python \
  libressl2.5-libcrypto \
  libc6-compat \
  libressl2.5-libssl \
  librdkafka-dev=0.9.5-r0

# RUN apk add --update --upgrade --no-cache tini 
# RUN apk add --update --upgrade --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted librdkafka-dev
ENV WITH_SASL 0
ENV BUILD_LIBRDKAFKA 0

COPY package.json package-lock.json ./

RUN npm install 

COPY . .
