FROM node:lts
WORKDIR /app
COPY . .
RUN npm install
RUN npm run push
CMD ["npm", "start"]