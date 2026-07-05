const aiClient = require('./utils/aiClient');
const formatter = require('./utils/formatter');

async function generate(payload) {
  // payload: { text, cursor }
  const prompt = formatter.formatHighlightPrompt(payload);
  const response = await aiClient.post('/v1/generate/highlight', { prompt });
  return response.data;
}

module.exports = { generate };
