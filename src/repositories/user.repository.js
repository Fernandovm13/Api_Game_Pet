const db = require('../config/db');

class UserRepository {
  async findByFirebaseUid(firebaseUid) {
    const [rows] = await db.execute('SELECT * FROM users WHERE firebase_uid = ?', [firebaseUid]);
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  async findById(userId) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
  }

  async create(userData) {
    const { firebaseUid, email, displayName } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (firebase_uid, email, displayName) VALUES (?, ?, ?)',
      [firebaseUid, email, displayName]
    );
    return result.insertId;
  }

  async updateExpAndLevel(userId, experience, level) {
    await db.execute(
      'UPDATE users SET experience = ?, level = ? WHERE id = ?',
      [experience, level, userId]
    );
  }

  async updateFcmToken(userId, fcmToken) {
    await db.execute('UPDATE users SET fcm_token = ? WHERE id = ?', [fcmToken, userId]);
  }
}

module.exports = new UserRepository();
