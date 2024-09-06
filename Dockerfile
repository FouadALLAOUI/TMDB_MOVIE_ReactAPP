FROM node:alpine as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]

#FROM nginx:latest
#
#WORKDIR /usr/share/nginx/html
#
#RUN rm -rf ./*
#
#COPY --from=builder /app/build .
#
#ENTRYPOINT ["nginx", "-g", "daemon off;"]


