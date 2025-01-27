let globalData = null;

function setGlobalData(data) {
  globalData = data;
}

function getGlobalData() {
  return globalData;
}

module.exports = {
  setGlobalData,
  getGlobalData,
};