FROM node:8.11.4-alpine

WORKDIR /usr/src

COPY package*.json ./
RUN npm install

COPY . .
