// Minimal server-side API endpoint that an external webhook router can call to trigger updates.
// This file is framework-agnostic: export a handler function or use it inside an Express route as needed.

module.exports = async function handleUpdate(req, res) {
  const payload = req.body || {};
  // Here you would validate, enqueue work, or call your ai-service to analyze the event.
  // Example forward:
  const axios = require('axios');
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:4000';
  try {
    await axios.post(`${AI_SERVICE_URL}/event`, payload);
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to forward update', err);
    res.status(500).json({ error: String(err) });
  }
};
