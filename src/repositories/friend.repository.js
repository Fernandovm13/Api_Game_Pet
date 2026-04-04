const db = require('../config/db');

class FriendRepository {
  async addRequest(user1Id, user2Id) {
    const [result] = await db.execute(
      'INSERT INTO friends (user_id_1, user_id_2, status) VALUES (?, ?, "PENDING")',
      [user1Id, user2Id]
    );
    return result.insertId;
  }

  async getPendingRequests(userId) {
    const [rows] = await db.execute(
      'SELECT f.id, u.firebase_uid, u.displayName, u.level FROM friends f JOIN users u ON f.user_id_1 = u.id WHERE f.user_id_2 = ? AND f.status = "PENDING"',
      [userId]
    );
    return rows;
  }

  async acceptRequest(userId, requestId) {
    await db.execute(
      'UPDATE friends SET status = "ACCEPTED" WHERE id = ? AND user_id_2 = ?',
      [requestId, userId]
    );
  }

  async getFriendsList(userId) {
    const [rows] = await db.execute(
      'SELECT u.id, u.firebase_uid, u.displayName, u.level, u.experience FROM friends f JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id) WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = "ACCEPTED" AND u.id != ?',
      [userId, userId, userId]
    );
    return rows;
  }

  async checkExisting(user1Id, user2Id) {
    const [rows] = await db.execute(
      'SELECT * FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
      [user1Id, user2Id, user2Id, user1Id]
    );
    return rows[0];
  }

  async findById(requestId) {
    const [rows] = await db.execute('SELECT * FROM friends WHERE id = ?', [requestId]);
    return rows[0];
  }
}

module.exports = new FriendRepository();
