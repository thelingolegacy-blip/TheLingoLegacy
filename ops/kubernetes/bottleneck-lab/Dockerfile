FROM node:22-alpine

ENV NODE_ENV=production PORT=8080 LAB_MODE=true MAX_IN_FLIGHT=8 MAX_QUEUE=16 MAX_DELAY_MS=1500
WORKDIR /app
COPY --chown=10001:10001 server.mjs ./server.mjs
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=2s --start-period=3s --retries=3 CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
