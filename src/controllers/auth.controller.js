const authUseCase = require('../usecases/auth.usecase');

class AuthController {
  async firebaseLogin(req, res) {
    try {
      const decodedUser = req.user;
      const user = await authUseCase.loginOrRegister(decodedUser);
      res.status(200).json({
        message: 'Bienvenido(a) a AuraFit Pro',
        user: {
          id: user.id,
          displayName: user.displayName,
          level: user.level,
          experience: user.experience
        }
      });
    } catch (error) {
      console.error('Error en Auth Controller:', error);
      res.status(500).json({ message: 'Error interno al procesar el login.' });
    }
  }
}

module.exports = new AuthController();
