FROM node:8-alpine AS base
LABEL maintainer Daniel Olivares "daniel.olivares@parkhub.com"

RUN apk add --update --upgrade --no-cache git
RUN mkdir /npm-module
WORKDIR /npm-module

RUN apk --update --upgrade add --virtual build-deps \
  cyrus-sasl-dev \
  make \
  gcc \
  g++ \
  bash \
  python \
  libressl2.5-libcrypto \
  libc6-compat \
  libressl2.5-libssl 

RUN apk add --update --upgrade --no-cache tini 
RUN apk add --update --upgrade --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted librdkafka-dev
ENV WITH_SASL 0
ENV BUILD_LIBRDKAFKA 0

# RUN apk add --update --upgrade --no-cache \
#   make \
#   gcc \
#   g++ \
#   bash \
#   python \
#   libressl2.5-libcrypto \
#   libressl2.5-libssl \
#   cyrus-sasl-dev \
#   zlib \
#   libsasl \
#   openssl-dev \
#   libc6-compat 
#
COPY package.json .

RUN npm install 

COPY . .

RUN rm -rf /tmp/*
