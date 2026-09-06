FROM node:20-alpine
WORKDIR /app
# better-sqlite3 has no prebuilt binary for Alpine and compiles from source.
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./
EXPOSE 4100
CMD ["node", "index.js"]
