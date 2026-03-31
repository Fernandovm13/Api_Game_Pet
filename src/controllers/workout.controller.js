const workoutUseCase = require('../usecases/workout.usecase');

class WorkoutController {
  async startWorkout(req, res) {
    try {
      const { type } = req.body;
      const workoutId = await workoutUseCase.startWorkout(req.user.uid, type);
      res.status(201).json({ message: 'Entrenamiento iniciado', workoutId });
    } catch (error) {
      console.error('Error al iniciar entrenamiento:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  async addSet(req, res) {
    try {
      const { workoutId, repsCount, intensityScore } = req.body;
      const result = await workoutUseCase.addSetToWorkout(workoutId, req.user.uid, repsCount, intensityScore);
      res.status(200).json({
        message: 'Serie registrada',
        xpGained: result.xpGained,
        currentExperience: result.newExperience,
        currentLevel: result.newLevel
      });
    } catch (error) {
      console.error('Error al registrar serie:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  async finishWorkout(req, res) {
    try {
      const { workoutId, totalReps, totalDistance, avgCadence } = req.body;
      const workout = await workoutUseCase.completeWorkout(workoutId, totalReps, totalDistance, avgCadence);
      res.status(200).json({ message: 'Entrenamiento finalizado y guardado', workout });
    } catch (error) {
      console.error('Error al finalizar entrenamiento:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
}

module.exports = new WorkoutController();
