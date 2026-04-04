const friendRepository = require('../repositories/friend.repository');
const userRepository = require('../repositories/user.repository');
const admin = require('../config/firebase');

class FriendUseCase {
  async sendFriendRequest(fromFirebaseUid, targetEmail) {
    const fromUser = await userRepository.findByFirebaseUid(fromFirebaseUid);
    const targetUser = await userRepository.findByEmail(targetEmail);

    if (!targetUser) throw new Error('Atleta no encontrado.');
    if (fromUser.id === targetUser.id) throw new Error('No puedes agregarte a ti mismo.');

    const existing = await friendRepository.checkExisting(fromUser.id, targetUser.id);
    if (existing) throw new Error('Ya existe una solicitud o ya son amigos.');

    const requestId = await friendRepository.addRequest(fromUser.id, targetUser.id);

    if (targetUser.fcm_token) {
      try {
        await admin.messaging().send({
          token: targetUser.fcm_token,
          notification: {
            title: '¡Nueva solicitud de amistad!',
            body: `${fromUser.displayName} te ha enviado una solicitud en AuraFit Pro.`
          }
        });
      } catch (err) {
        console.error('Error enviando notificación al celular de destino:', err);
      }
    }

    return requestId;
  }

  async acceptFriendship(userId, requestId) {
    await friendRepository.acceptRequest(userId, requestId);

    try {
      const friendship = await friendRepository.findById(requestId);
      if (friendship) {
         const originalSender = await userRepository.findById(friendship.user_id_1);
         const currentUser = await userRepository.findById(userId); 

         if (originalSender && originalSender.fcm_token) {
            await admin.messaging().send({
              token: originalSender.fcm_token,
              notification: {
                title: '¡Amistad aceptada!',
                body: `¡${currentUser.displayName} aceptó tu solicitud!`
              }
            });
         }
      }
    } catch (err) {
      console.error('Error avisándole al original que fue aceptado:', err);
    }
  }

  async getMyFriends(firebaseUid) {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    return await friendRepository.getFriendsList(user.id);
  }

  async getMyPending(firebaseUid) {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    return await friendRepository.getPendingRequests(user.id);
  }
}

module.exports = new FriendUseCase();
