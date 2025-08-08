FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .eslintrc.json ./

COPY wait-for-it.sh ./
RUN chmod +x wait-for-it.sh

RUN npm install

COPY src ./src

RUN npm run build

CMD [ "npm", "start" ]
