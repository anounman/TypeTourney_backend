FROM node:20-alpine

WORKDIR /user/src/app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn" , "dev"]