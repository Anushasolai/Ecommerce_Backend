FROM node:alpine

ENV NODE_ENV=production

COPY ["package.json","package-lock.json","./"]

RUN npm install --production

COPY . .

EXPOSE 5000

CMD [ "npm","start" ]