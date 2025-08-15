FROM node:lts
WORKDIR /app
COPY package*.json /app
COPY . .
RUN npm install
RUN npm run push
CMD ["node", "."]