const admin = require('../config/firebase');
const userRepository = require('../repositories/user.repository');

class NotificationController {
  async sendTestNotification(req, res) {
    const { targetUserId, title, body } = req.body;

    try {
      const user = await userRepository.findByFirebaseUid(targetUserId); 
      
      if (!user || !user.fcm_token) {
        return res.status(404).json({ message: 'Usuario no encontrado o no tiene Token FCM registrado.' });
      }

      const message = {
        notification: {
          title: title || '💪 AuraFit Pro: ¡Neo te extraña!',
          body: body || 'Llevas 24 horas sin entrenar. ¡Hagamos 20 sentadillas!',
        },
        token: user.fcm_token,
      };

      const response = await admin.messaging().send(message);
      res.status(200).json({ message: 'Notificación enviada con éxito', response });
    } catch (error) {
      console.error('Error enviando notificación:', error);
      res.status(500).json({ message: 'Error al enviar notificación' });
    }
  }
}

module.exports = new NotificationController();
