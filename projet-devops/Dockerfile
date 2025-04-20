
FROM node:18-alpine3.18

WORKDIR /opt/app

COPY package.json yarn.lock ./

RUN npm install && npm install pg

COPY . .

EXPOSE 1337

CMD ["npx", "strapi", "develop"]
