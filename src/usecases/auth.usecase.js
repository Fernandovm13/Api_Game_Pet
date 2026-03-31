const userRepository = require('../repositories/user.repository');

class AuthUseCase {
  async loginOrRegister(decodedToken) {
    const { uid, email, name } = decodedToken;
    let user = await userRepository.findByFirebaseUid(uid);

    if (!user) {
      await userRepository.create({
        firebaseUid: uid,
        email: email || null,
        displayName: name || 'Atleta'
      });
      user = await userRepository.findByFirebaseUid(uid);
    }

    return user;
  }
}

module.exports = new AuthUseCase();
