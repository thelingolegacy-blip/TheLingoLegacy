# Proposal-only scaffold: not the canonical Cloudflare Worker runtime.
# Pin this base image to an approved digest before any release build.
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Docker build context is containers/; copy only the standalone health service.
COPY --chown=node:node server.mjs ./server.mjs

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
