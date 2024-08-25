FROM node:current-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/main.js" ]
