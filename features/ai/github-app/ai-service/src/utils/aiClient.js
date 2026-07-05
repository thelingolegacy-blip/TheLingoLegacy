const axios = require('axios');

const AI_BASE = process.env.AI_BASE_URL || 'https://ai.thelingolegacy.com';
const API_KEY = process.env.AI_API_KEY || '';

const client = axios.create({
  baseURL: AI_BASE,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: API_KEY ? `Bearer ${API_KEY}` : undefined,
  },
});

module.exports = client;
