const db = require('../config/db');

async function getPetBundleByUserId(userId) {
  const [rows] = await db.query(
    `SELECT
      u.id AS user_id,
      u.firebase_uid,
      u.email,
      u.name AS user_name,
      u.avatar_url,
      p.id AS pet_id,
      p.name AS pet_name,
      p.species,
      p.level,
      p.experience,
      p.mood,
      p.is_sleeping,
      p.image_url,
      s.happiness,
      s.last_fed_at,
      s.last_played_at,
      s.last_sleep_at,
      s.updated_at AS stats_updated_at
     FROM users u
     INNER JOIN pets p ON p.user_id = u.id
     INNER JOIN pet_stats s ON s.pet_id = p.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function updatePetStats(petId, stats, mood, isSleeping) {
  await db.query(
    `UPDATE pet_stats
     SET hunger = ?, energy = ?, happiness = ?, updated_at = NOW()
     WHERE pet_id = ?`,
    [stats.hunger, stats.energy, stats.happiness, petId]
  );

  await db.query(
    `UPDATE pets
     SET mood = ?, is_sleeping = ?, experience = ?, level = ?, updated_at = NOW()
     WHERE id = ?`,
    [mood, isSleeping ? 1 : 0, stats.experience, stats.level, petId]
  );
}

async function updatePetActionTimestamps(petId, action) {
  if (action === 'feed') {
    await db.query(
      'UPDATE pet_stats SET last_fed_at = NOW() WHERE pet_id = ?',
      [petId]
    );
  }

  if (action === 'play') {
    await db.query(
      'UPDATE pet_stats SET last_played_at = NOW() WHERE pet_id = ?',
      [petId]
    );
  }

  if (action === 'sleep' || action === 'wake') {
    await db.query(
      'UPDATE pet_stats SET last_sleep_at = NOW() WHERE pet_id = ?',
      [petId]
    );
  }
}

async function insertInteraction(userId, petId, type, details) {
  await db.query(
    `INSERT INTO interactions (user_id, pet_id, type, details)
     VALUES (?, ?, ?, ?)`,
    [userId, petId, type, JSON.stringify(details || {})]
  );
}

module.exports = {
  getPetBundleByUserId,
  updatePetStats,
  updatePetActionTimestamps,
  insertInteraction
};