const db = require('../config/db');

async function upsertDeviceToken(userId, fcmToken, platform = 'android') {
  const [rows] = await db.query(
    'SELECT id FROM device_tokens WHERE fcm_token = ? LIMIT 1',
    [fcmToken]
  );

  if (rows.length) {
    await db.query(
      `UPDATE device_tokens
       SET user_id = ?, platform = ?, updated_at = NOW()
       WHERE fcm_token = ?`,
      [userId, platform, fcmToken]
    );
    return;
  }

  await db.query(
    `INSERT INTO device_tokens (user_id, fcm_token, platform)
     VALUES (?, ?, ?)`,
    [userId, fcmToken, platform]
  );
}

async function getDeviceTokensByUserId(userId) {
  const [rows] = await db.query(
    'SELECT fcm_token FROM device_tokens WHERE user_id = ?',
    [userId]
  );
  return rows.map((row) => row.fcm_token);
}

module.exports = {
  upsertDeviceToken,
  getDeviceTokensByUserId
};