FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY server.mjs ./
COPY identity ./identity
COPY sonic-boom ./sonic-boom
COPY ai ./ai
COPY evidence ./evidence
COPY dashboard ./dashboard
COPY schemas ./schemas
RUN mkdir -p /data && chown -R node:node /data
USER node
EXPOSE 8787 8788
CMD ["node", "server.mjs"]
