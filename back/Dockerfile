FROM node

WORKDIR /data/back

ADD package*.json /data/back/
RUN npm install 
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]