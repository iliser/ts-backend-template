# Fastify & Typescript App

## Description

Fastify & TypeScript starter repository.

## Installation

npx degit iliser\ts-backend-template
or
git clone git@github.com:iliser/ts-backend-template.git

## Usage

```bash
# development: hot reload with nodemon
$ npm run dev

# debug
$ npm run debug

# format with prettier
$ npm run format

# build for production
$ npm run build

# production
$ npm run prod

# in prod server
$ pm2 start ecosystem.config.js --env production

# deploy to server
$ git commit
$ pm2 deploy --env production
```
## Roadmap

- [x] File loading

- [ ] Change crud integration with fastify
- [ ] Move crud to separate package
- [ ] Change auth strategy