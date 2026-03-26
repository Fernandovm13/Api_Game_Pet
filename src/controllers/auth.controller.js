const { firebaseLogin } = require('../usecases/auth.usecase');

async function firebaseAuth(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken es requerido.' });
    }

    const result = await firebaseLogin(idToken);

    return res.json({
      message: 'Autenticación correcta.',
      ...result
    });
  } catch (error) {
    return res.status(401).json({
      message: 'No se pudo autenticar con Firebase.',
      error: error.message
    });
  }
}

module.exports = {
  firebaseAuth
};