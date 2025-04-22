const path = require('path');
const fs = require('fs');
const stringSimilarity = require('string-similarity');

const badwords = [
  'anjing', 'goblok', 'tai', 'memek', 'asu', 'ndasmu',
  'palalu', 'cangkemmu', 'ngentod', 'cangkeman', 'matane',
  'tolol', 'kontol', 'babi', 'bangsat'
];

const warningPath = path.join(__dirname, '../.warning.json');
let userWarnings = fs.existsSync(warningPath)
  ? JSON.parse(fs.readFileSync(warningPath, 'utf-8'))
  : {};

function saveWarnings() {
  fs.writeFileSync(warningPath, JSON.stringify(userWarnings, null, 2));
}

module.exports = async (sock, m, text) => {
  try {
    const sender = m.key.participant || m.key.remoteJid;
    const lowerText = text.toLowerCase();
    const match = stringSimilarity.findBestMatch(lowerText, badwords);

    if (match.bestMatch.rating >= 0.8) {
      userWarnings[sender] = (userWarnings[sender] || 0) + 1;
      saveWarnings();

      if (userWarnings[sender] >= 3) {
        await sock.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
        await sock.sendMessage(m.key.remoteJid, {
          text: `🚫 @${sender.split('@')[0]} telah dikeluarkan karena berkata kasar!`,
          mentions: [sender]
        });
        delete userWarnings[sender];
        saveWarnings();
      } else {
        await sock.sendMessage(m.key.remoteJid, {
          text: `⚠️ Awas! Hindari kata kasar.\nWarning ${userWarnings[sender]}/3`,
          quoted: m
        });
      }
    }
  } catch (err) {
    console.error('❌ Error di badwordDetector:', err);
  }
};
