const express = require('express');
const authController = require('../controllers/auth.controller');
const authFirebase = require('../middlewares/authFirebase');

const router = express.Router();

router.post('/login', authFirebase, authController.firebaseLogin);

router.put('/fcm-token', authFirebase, async (req, res) => {
  const { fcmToken } = req.body;
  const userRepository = require('../repositories/user.repository');
  try {
    const user = await userRepository.findByFirebaseUid(req.user.uid);
    await userRepository.updateFcmToken(user.id, fcmToken);
    res.json({ message: 'Token FCM actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar token' });
  }
});

module.exports = router;
