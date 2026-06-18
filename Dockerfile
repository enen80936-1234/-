FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV DATA_DIR=/data
ENV PORT=80

EXPOSE 80

CMD ["node", "server.js"]