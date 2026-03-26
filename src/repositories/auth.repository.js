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
  const [fullRows] = await db.query(
    `SELECT p.* FROM pets p
     INNER JOIN pet_stats s ON s.pet_id = p.id
     WHERE p.user_id = ? LIMIT 1`,
    [userId]
  );

  if (fullRows.length) return fullRows[0];

  const [petOnly] = await db.query('SELECT id FROM pets WHERE user_id = ? LIMIT 1', [userId]);
  let petId;

  if (!petOnly.length) {
    const [result] = await db.query(
      `INSERT INTO pets (user_id, name, species, level, experience, mood, is_sleeping)
       VALUES (?, 'Neo', 'Mascota', 1, 0, 'neutral', 0)`,
      [userId]
    );
    petId = result.insertId;
  } else {
    petId = petOnly[0].id;
  }

  const [statsOnly] = await db.query('SELECT id FROM pet_stats WHERE pet_id = ? LIMIT 1', [petId]);
  if (!statsOnly.length) {
    await db.query(
      `INSERT INTO pet_stats (pet_id, hunger, energy, happiness)
       VALUES (?, 20, 80, 70)`,
      [petId]
    );
  }

  const [finalRows] = await db.query('SELECT * FROM pets WHERE id = ? LIMIT 1', [petId]);
  return finalRows[0];
}

module.exports = {
  findUserByFirebaseUid,
  createUser,
  updateUser,
  ensureDefaultPet
};