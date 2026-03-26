const db = require('../config/db');

async function createNotification({ userId, petId, type, title, body, sentVia = 'api' }) {
  const [result] = await db.query(
    `INSERT INTO notifications (user_id, pet_id, type, title, body, sent_via)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, petId, type, title, body, sentVia]
  );

  return {
    id: result.insertId,
    user_id: userId,
    pet_id: petId,
    type,
    title,
    body,
    sent_via: sentVia
  };
}

async function listNotificationsByUserId(userId) {
  const [rows] = await db.query(
    `SELECT *
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );

  return rows;
}

async function markNotificationAsRead(notificationId, userId) {
  const [result] = await db.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  createNotification,
  listNotificationsByUserId,
  markNotificationAsRead
};