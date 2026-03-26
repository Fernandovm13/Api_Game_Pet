const db = require('../config/db');

async function findUserByFirebaseUid(firebaseUid) {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE firebase_uid = ? LIMIT 1',
    [firebaseUid]
  );
  return rows[0] || null;
}

async function createUser({ firebaseUid, email, name, avatarUrl }) {
  const [result] = await db.query(
    `INSERT INTO users (firebase_uid, email, name, avatar_url)
     VALUES (?, ?, ?, ?)`,
    [firebaseUid, email, name, avatarUrl]
  );

  return {
    id: result.insertId,
    firebase_uid: firebaseUid,
    email,
    name,
    avatar_url: avatarUrl
  };
}

async function updateUser(id, { email, name, avatarUrl }) {
  await db.query(
    `UPDATE users
     SET email = ?, name = ?, avatar_url = ?, updated_at = NOW()
     WHERE id = ?`,
    [email, name, avatarUrl, id]
  );
}

async function ensureDefaultPet(userId) {
  const [rows] = await db.query(
    'SELECT * FROM pets WHERE user_id = ? LIMIT 1',
    [userId]
  );

  if (rows.length) return rows[0];

  const [result] = await db.query(
    `INSERT INTO pets (user_id, name, species, level, experience, mood, is_sleeping)
     VALUES (?, 'Neo', 'Mascota', 1, 0, 'neutral', 0)`,
    [userId]
  );

  const petId = result.insertId;

  await db.query(
    `INSERT INTO pet_stats (pet_id, hunger, energy, happiness, hygiene)
     VALUES (?, 20, 80, 70, 80)`,
    [petId]
  );

  const [petRows] = await db.query(
    'SELECT * FROM pets WHERE id = ? LIMIT 1',
    [petId]
  );

  return petRows[0];
}

module.exports = {
  findUserByFirebaseUid,
  createUser,
  updateUser,
  ensureDefaultPet
};