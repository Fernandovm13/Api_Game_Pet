const friendRepository = require('../repositories/friend.repository');
const userRepository = require('../repositories/user.repository');

class FriendUseCase {  
  async sendFriendRequest(fromFirebaseUid, targetEmail) {
    const fromUser = await userRepository.findByFirebaseUid(fromFirebaseUid);
    const targetUser = await userRepository.findByEmail(targetEmail); 
    if (!targetUser) throw new Error('No se encontró ningún atleta con este correo.');
    if (fromUser.id === targetUser.id) throw new Error('No puedes agregarte a ti mismo.');
    const existing = await friendRepository.checkExisting(fromUser.id, targetUser.id);
    if (existing) throw new Error('Ya existe una solicitud o ya son amigos.');
    return await friendRepository.addRequest(fromUser.id, targetUser.id);
  }

  async acceptFriendship(userId, requestId) {
    return await friendRepository.acceptRequest(userId, requestId);
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
