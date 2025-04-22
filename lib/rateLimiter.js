const config = require('../config');
const path = require('path');
const fs = require('fs');
const rateLimitDataPath = path.join(__dirname, '../data/rateLimit.json');

let rateMap = new Map();
if (fs.existsSync(rateLimitDataPath)) {
  const data = JSON.parse(fs.readFileSync(rateLimitDataPath));
  rateMap = new Map(Object.entries(data));
}

function saveRateLimitData() {
  fs.writeFileSync(rateLimitDataPath, JSON.stringify(Object.fromEntries(rateMap), null, 2));
}

function isRateLimited(user) {
  const now = Date.now();
  const userData = rateMap.get(user) || { count: 0, last: now };

  if (now - userData.last > config.rateLimit.windowMs) {
    userData.count = 1;
    userData.last = now;
  } else {
    userData.count++;
  }

  rateMap.set(user, userData);
  saveRateLimitData(); 

  return userData.count > config.rateLimit.max;
}

module.exports = { isRateLimited };
