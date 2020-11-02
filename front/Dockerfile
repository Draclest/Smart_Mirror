FROM node

WORKDIR /data/front


COPY package*.json ./

RUN npm install

COPY . .
EXPOSE 4200
RUN npm run build