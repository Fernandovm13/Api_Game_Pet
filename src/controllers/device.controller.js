const { registerDeviceToken } = require('../usecases/device.usecase');

async function registerToken(req, res) {
  try {
    const { fcmToken, platform = 'android' } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'fcmToken es requerido.' });
    }

    await registerDeviceToken(req.dbUser.id, fcmToken, platform);

    return res.json({ message: 'Token registrado correctamente.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error registrando token.',
      error: error.message
    });
  }
}

module.exports = {
  registerToken
};