FROM node:14-alpine

ENV SLACKLORD_PORT 80

WORKDIR /usr/src/app

COPY package*.json ./
COPY server/ ./server/
COPY dist/ ./dist/

RUN npm install --production

EXPOSE 80

CMD ["npm", "start"]
