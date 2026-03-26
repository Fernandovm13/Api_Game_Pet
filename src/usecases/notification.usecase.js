const admin = require('../config/firebase');
const { createNotification } = require('../repositories/notification.repository');
const { getDeviceTokensByUserId } = require('../repositories/device.repository');

async function createAndSendNotification({ userId, petId, type, title, body, data = {} }) {
  const notification = await createNotification({
    userId,
    petId,
    type,
    title,
    body,
    sentVia: 'fcm'
  });

  const tokens = await getDeviceTokensByUserId(userId);
  const results = [];

  for (const token of tokens) {
    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries({
            notificationId: notification.id,
            petId,
            type,
            ...data
          }).map(([k, v]) => [k, String(v)])
        )
      });

      results.push({ token, ok: true });
    } catch (error) {
      results.push({ token, ok: false, error: error.message });
    }
  }

  return { notification, pushResults: results };
}

module.exports = {
  createAndSendNotification
};