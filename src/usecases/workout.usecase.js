const workoutRepository = require('../repositories/workout.repository');
const userRepository = require('../repositories/user.repository');

class WorkoutUseCase {
  async startWorkout(firebaseUid, type) {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    if (!user) throw new Error('Atleta no encontrado en la base de datos.');
    
    return await workoutRepository.createWorkout(user.id, type);
  }

  async addSetToWorkout(workoutId, userId, repsCount, intensityScore) {
    await workoutRepository.addSet(workoutId, repsCount, intensityScore);

    const xpGained = Math.round(repsCount * 10 * intensityScore);

    const user = await userRepository.findByFirebaseUid(userId); 
    let newExperience = user.experience + xpGained;
    let newLevel = user.level;

    while (newExperience >= 100) {
      newExperience -= 100;
      newLevel++;
    }

    await userRepository.updateExpAndLevel(user.id, newExperience, newLevel);

    return { xpGained, newLevel, newExperience };
  }

  async completeWorkout(workoutId, totalReps, totalDistance, avgCadence) {
    await workoutRepository.finishWorkout(workoutId, totalReps, totalDistance, avgCadence);
    return await workoutRepository.getWorkoutById(workoutId);
  }
}

module.exports = new WorkoutUseCase();
