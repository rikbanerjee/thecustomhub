# Track B5 — Cloud Run image for raos-mcp-server/.
#
# Built from the REPO ROOT (gcloud run deploy --source .) so the server can
# `require('../raos/adapter')`, `require('../src/data/products.json')`, and
# install `@retailagentos/engine` from `../vendor/*.tgz` without any file
# duplication — unlike Firebase Functions, Cloud Run's build context isn't
# confined to one subdirectory, so there's no sync step needed here (see
# scripts/sync-raos-functions.js for why that one *does* need it).
FROM node:20-slim

WORKDIR /app

COPY raos-mcp-server/package.json raos-mcp-server/package.json
COPY raos/ raos/
COPY vendor/ vendor/
COPY src/data/products.json src/data/products.json

WORKDIR /app/raos-mcp-server
RUN npm install --omit=dev

COPY raos-mcp-server/server.js .

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
