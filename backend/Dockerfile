FROM node:latest

RUN mkdir -p /usr/src/app
 
# Switch to working directory
WORKDIR /usr/src/app

COPY ./src/ ./src
COPY package.json .
COPY package-lock.json .

RUN npm install

 
# Expose port from container so host can access 3000
# EXPOSE 3000
 
# Start the Node.js app on load
CMD [ "npm", "run", "dev" ]