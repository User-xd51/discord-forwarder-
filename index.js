const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DESTINATION_WEBHOOK_URL = process.env.DESTINATION_WEBHOOK_URL;
const SECRET_PATH = process.env.SECRET_PATH || 'webhook';

let messagesForwarded = 0;
let lastMessageTime = null;

app.get('/', (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get('host')}/${SECRET_PATH}`;
  res.send(`
    <html>
      <head>
        <title>Discord Webhook Forwarder</title>
        <style>
          body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .status { color: #28a745; font-weight: bold; }
          code { background: #f0f0f0; padding: 3px 8px; border-radius: 4px; }
          .url-box { background: #e3f2fd; padding: 15px; border-radius: 6px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🔗 Discord Webhook Forwarder</h1>
          <p>Status: <span class="status">✅ Online</span></p>
          <p>Messages forwarded: <strong>${messagesForwarded}</strong></p>
          <p>Last message: <strong>${lastMessageTime ? new Date(lastMessageTime).toLocaleString() : 'None yet'}</strong></p>
        </div>
        
        <div class="card">
          <h2>🔧 Your Webhook URL</h2>
          <p>Use this in your Discord source webhook:</p>
          <div class="url-box"><code>${webhookUrl}</code></div>
        </div>
      </body>
    </html>
  `);
});

app.post(`/${SECRET_PATH}`, async (req, res) => {
  try {
    res.status(200).send('OK');
    
    if (!DESTINATION_WEBHOOK_URL) {
      console.error('❌ DESTINATION_WEBHOOK_URL not configured');
      return;
    }
    
    await axios.post(DESTINATION_WEBHOOK_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    messagesForwarded++;
    lastMessageTime = Date.now();
    console.log(`✅ Forwarded message`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
