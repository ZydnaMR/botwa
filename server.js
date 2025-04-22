const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Bot WhatsApp aktif!');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server aktif di port ${PORT}`);
});
