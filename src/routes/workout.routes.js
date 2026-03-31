const express = require('express');
const workoutController = require('../controllers/workout.controller');
const authFirebase = require('../middlewares/authFirebase');

const router = express.Router();

router.post('/start', authFirebase, workoutController.startWorkout);
router.post('/add-set', authFirebase, workoutController.addSet);
router.post('/finish', authFirebase, workoutController.finishWorkout);

module.exports = router;
