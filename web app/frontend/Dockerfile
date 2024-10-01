# Use the slim version of the node 14 image as our base
FROM node:14-slim

RUN mkdir -p usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install -g serve
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["serve", "-s", "-l", "8080", "./build"]