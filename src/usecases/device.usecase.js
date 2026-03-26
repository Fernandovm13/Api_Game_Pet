const { upsertDeviceToken } = require('../repositories/device.repository');

async function registerDeviceToken(userId, fcmToken, platform) {
  await upsertDeviceToken(userId, fcmToken, platform);
  return true;
}

module.exports = {
  registerDeviceToken
};