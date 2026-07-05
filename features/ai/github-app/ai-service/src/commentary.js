const aiClient = require('./utils/aiClient');
const formatter = require('./utils/formatter');

async function generate(payload) {
  // payload: { repo, prNumber, diff, context }
  const prompt = formatter.formatCommentaryPrompt(payload);
  const response = await aiClient.post('/v1/generate/commentary', { prompt });
  return response.data;
}

module.exports = { generate };
