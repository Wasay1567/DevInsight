FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

ENV NODE_ENV=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"] 