module.exports.loadAll = (sock) => {
  require('../events/onMessage')(sock);
};
