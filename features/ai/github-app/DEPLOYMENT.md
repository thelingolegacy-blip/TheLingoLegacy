# Deployment guide for features/ai/github-app

This document describes how to deploy the ai-service and related components.

Prerequisites
- Docker & docker-compose
- Environment variables configured (see .env.example)

Quick start (docker-compose)
1. Copy .env.example to .env and fill in values (AI_API_KEY, AI_BASE_URL, AI_SERVICE_PORT).
2. From repository root run:

   docker-compose -f features/ai/github-app/docker-compose.yml up --build -d

Services
- ai-service: Node.js service exposing /commentary, /highlight, /balance
- (optional) server: your existing backend can mount the webhook route in server/src/webhooks/eventWebhook.js

Environment variables (recommended)
- AI_API_KEY - API key for ai.thelingolegacy.com (or your provider)
- AI_BASE_URL - Base URL for AI service (defaults to https://ai.thelingolegacy.com)
- AI_SERVICE_PORT - Port for the local ai-service (default: 4000)

Secrets
- Do NOT store secrets in the repo. Use GitHub Secrets for CI, or environment variables in your deployment system.

Notes
- The code includes placeholders using the domain ai.thelingolegacy.com. Replace or override with AI_BASE_URL via environment variables.
- The server webhook router is a lightweight forwarder. Validate GitHub signatures before enabling in production.
