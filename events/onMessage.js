const autoResponse = require('../plugins/autoResponse');
const badwordDetector = require('../plugins/badwordDetector');
const linkFilter = require('../plugins/linkFilter');

module.exports = function (sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;

      const text =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        '';

      if (!text.trim()) return;

      await autoResponse(sock, m, text);
      await badwordDetector(sock, m, text);
      await linkFilter(sock, m, text);
    } catch (err) {
      console.error('❌ Error di event messages.upsert:', err);
    }
  });
};
