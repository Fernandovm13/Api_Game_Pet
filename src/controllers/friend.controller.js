const friendUseCase = require('../usecases/friend.usecase');

class FriendController {
  async sendRequest(req, res) {
    try {
      const { targetFirebaseUid } = req.body;
      await friendUseCase.sendFriendRequest(req.user.uid, targetFirebaseUid);
      res.status(201).json({ message: 'Solicitud de amistad enviada con éxito.' });
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async invitations(req, res) {
    try {
      const requests = await friendUseCase.getMyPending(req.user.uid);
      res.status(200).json({ requests });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener solicitudes.' });
    }
  }

  async accept(req, res) {
    try {
      const { requestId, userId } = req.body; 
      await friendUseCase.acceptFriendship(userId, requestId);
      res.status(200).json({ message: '¡Ahora son amigos!' });
    } catch (error) {
      res.status(500).json({ message: 'Error al aceptar solicitud.' });
    }
  }

  async list(req, res) {
    try {
      const friends = await friendUseCase.getMyFriends(req.user.uid);
      res.status(200).json({ friends });
    } catch (error) {
      res.status(500).json({ message: 'Error al listar amigos.' });
    }
  }
}

module.exports = new FriendController();
