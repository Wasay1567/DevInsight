# stage 1 build
FROM node:20-alpine as builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

ENV NODE_ENV=production

COPY . .

RUN npm run build

# stage 2 production
FROM nginx:alpine
COPY --from=builder app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]