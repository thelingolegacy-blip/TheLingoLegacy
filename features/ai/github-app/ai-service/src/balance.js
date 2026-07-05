const aiClient = require('./utils/aiClient');

async function get() {
  const response = await aiClient.get('/v1/balance');
  return response.data;
}

module.exports = { get };
