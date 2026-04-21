FROM node:18-alpine
RUN npm install -g json-server
WORKDIR /data
COPY db.json .
CMD ["json-server", "--host", "0.0.0.0", "--port", "3001", "--watch", "db.json"]