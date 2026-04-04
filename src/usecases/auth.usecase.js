const userRepository = require('../repositories/user.repository');

class AuthUseCase {
  async loginOrRegister(decodedToken) {
    const { uid, email, name } = decodedToken;
    let user = await userRepository.findByFirebaseUid(uid);

    if (!user) {
      let defaultName = 'Atleta';
      if (email) {
        const parts = email.split('@');
        defaultName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }

      await userRepository.create({
        firebaseUid: uid,
        email: email || null,
        displayName: name || defaultName 
      });
      user = await userRepository.findByFirebaseUid(uid);
    }

    return user;
  }
}

module.exports = new AuthUseCase();
