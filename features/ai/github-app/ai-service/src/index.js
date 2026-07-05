require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const commentary = require('./commentary');
const highlight = require('./highlight');
const balance = require('./balance');

const app = express();
app.use(bodyParser.json());

app.post('/commentary', async (req, res) => {
  try {
    const out = await commentary.generate(req.body);
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/highlight', async (req, res) => {
  try {
    const out = await highlight.generate(req.body);
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/balance', async (req, res) => {
  try {
    const out = await balance.get();
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.AI_SERVICE_PORT || 4000;
app.listen(PORT, () => console.log(`AI Service listening on ${PORT}`));
