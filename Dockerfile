FROM node:9.1.0-wheezy

EXPOSE 3003
WORKDIR /opt/ryankoval.pizza

COPY *.json ./
RUN npm install \
  && npm install -g bower \
  && bower install --allow-root \
  && npm cache clean --force

COPY lib ./lib
COPY public ./public
COPY config ./config
COPY views ./views

CMD npm start
