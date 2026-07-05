// Minimal webhook handler that forwards relevant events to the ai-service for processing.
// NOTE: This file is intended as a drop-in route. Do not overwrite your main server.js/app.js entry unless you ask.

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Reads AI service endpoint from env or uses the placeholder domain.
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:4000';

router.post('/webhooks/github', async (req, res) => {
  // Basic forwarding: receive GitHub webhook payload and forward to ai-service update endpoint.
  try {
    const event = req.headers['x-github-event'] || 'unknown';

    // You can enhance this by validating signatures, filtering events, etc.
    await axios.post(`${AI_SERVICE_URL}/update`, { event, payload: req.body });
    res.status(200).json({ status: 'forwarded' });
  } catch (err) {
    console.error('Failed to forward webhook to AI service', err);
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
