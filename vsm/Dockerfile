FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY server.mjs ./
COPY dashboard ./dashboard
COPY schemas ./schemas
RUN mkdir -p /data && chown -R node:node /data
USER node
EXPOSE 8787
CMD ["node", "server.mjs"]
