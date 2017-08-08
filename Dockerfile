FROM node:8-alpine AS base
LABEL maintainer Daniel Olivares "daniel.olivares@parkhub.com"

RUN apk add --update --upgrade --no-cache git
RUN mkdir /npm-module
WORKDIR /npm-module

COPY package.json package-lock.json ./

RUN npm install 

COPY . .

RUN rm -rf /tmp/*
