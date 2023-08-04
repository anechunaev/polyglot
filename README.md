# Modern and Minimal Frontend Boilerplate

This repository contains a Docker image that includes all the necessary dependencies to run a minimal Node.js server using TypeScript and Webpack bundling. With this image, you can easily build and run a server on any machine that has Docker installed. Using TypeScript and Webpack bundling ensures that your server will be efficient and reliable, while also making it easy to manage your codebase.

## Technologies
- **Client-side:** TypeScript v4
- **Server-side:** TypeScript v4, Node.js v18, Express v4

## Limitations and restrictions

**Server-side:**
- Node.js v.18
- Npm v.9
- TLS/SSL is not supported, instead it should be implemented by platform router or reverse-proxy

**Client-side:**
- IE browser is not supported

## Docker repository

`bungubot/boilerplate-nodejs-minimal`

## How to build
Production build:
```sh
$ npm run build
```

Development build:
```sh
$ npm run dev:build
```

Start server:
```sh
$ npm start
# or
$ ./bin/start.sh
```
