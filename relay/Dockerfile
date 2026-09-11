# Minimal VPS image for the IPTV stream relay
FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY server.mjs ./

ENV PORT=8080
EXPOSE 8080

# RELAY_SECRET must be provided at runtime
CMD ["node", "server.mjs"]
