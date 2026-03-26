const admin = require('../config/firebase');
const {
  findUserByFirebaseUid,
  createUser,
  updateUser,
  ensureDefaultPet
} = require('../repositories/auth.repository');

async function firebaseLogin(idToken) {
  const decoded = await admin.auth().verifyIdToken(idToken);

  const firebaseUid = decoded.uid;
  const email = decoded.email || null;
  const name = decoded.name || decoded.email?.split('@')[0] || 'Usuario';
  const avatarUrl = decoded.picture || null;

  let user = await findUserByFirebaseUid(firebaseUid);

  if (!user) {
    user = await createUser({
      firebaseUid,
      email,
      name,
      avatarUrl
    });
  } else {
    await updateUser(user.id, { email, name, avatarUrl });
    user = await findUserByFirebaseUid(firebaseUid);
  }

  const pet = await ensureDefaultPet(user.id);

  return { user, pet };
}

module.exports = {
  firebaseLogin
};