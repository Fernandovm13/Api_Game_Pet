const db = require('../config/db');

class WorkoutRepository {
  async createWorkout(userId, type) {
    const [result] = await db.execute(
      'INSERT INTO workouts (user_id, type) VALUES (?, ?)',
      [userId, type]
    );
    return result.insertId;
  }

  async addSet(workoutId, repsCount, intensityScore) {
    await db.execute(
      'INSERT INTO workout_sets (workout_id, reps_count, intensity_score) VALUES (?, ?, ?)',
      [workoutId, repsCount, intensityScore]
    );
  }

  async finishWorkout(workoutId, totalReps, totalDistance, avgCadence) {
    await db.execute(
      'UPDATE workouts SET ended_at = CURRENT_TIMESTAMP, total_reps = ?, total_distance = ?, avg_cadence = ? WHERE id = ?',
      [totalReps, totalDistance, avgCadence, workoutId]
    );
  }

  async getWorkoutById(workoutId) {
    const [rows] = await db.execute('SELECT * FROM workouts WHERE id = ?', [workoutId]);
    return rows[0];
  }
}

module.exports = new WorkoutRepository();
