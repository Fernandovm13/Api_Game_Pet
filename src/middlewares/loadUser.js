const { findUserByFirebaseUid } = require('../repositories/auth.repository');

module.exports = async function loadUser(req, res, next) {
  try {
    const uid = req.firebaseUser?.uid;

    if (!uid) {
      return res.status(401).json({ message: 'No se pudo leer el uid de Firebase.' });
    }

    const user = await findUserByFirebaseUid(uid);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado en MySQL. Primero llama /auth/firebase.'
      });
    }

    req.dbUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Error cargando usuario.',
      error: error.message
    });
  }
};