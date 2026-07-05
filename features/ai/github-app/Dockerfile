FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY features/ai/github-app/ai-service/package.json ./
RUN npm install --production

COPY features/ai/github-app/ai-service/src ./src

EXPOSE 4000
CMD ["node", "src/index.js"]
