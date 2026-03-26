const { getCurrentPetState, applyAction, makePetVoice } = require('../usecases/pet.usecase');
const { createAndSendNotification } = require('../usecases/notification.usecase');

async function getMyPet(req, res) {
  try {
    const result = await getCurrentPetState(req.dbUser.id);

    if (!result) {
      return res.status(404).json({ message: 'Mascota no encontrada.' });
    }

    for (const event of result.events || []) {
      await createAndSendNotification({
        userId: result.user.id,
        petId: result.pet.id,
        type: event.type,
        title: event.title,
        body: event.body,
        data: { source: 'passive-update' }
      });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Error obteniendo mascota.',
      error: error.message
    });
  }
}

async function handleAction(req, res, action, payload = {}) {
  try {
    const result = await applyAction(req.dbUser.id, action, payload);

    if (!result) {
      return res.status(404).json({ message: 'Mascota no encontrada.' });
    }

    for (const event of result.events || []) {
      await createAndSendNotification({
        userId: result.user.id,
        petId: result.pet.id,
        type: event.type,
        title: event.title,
        body: event.body,
        data: { action }
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${result.user.id}`).emit('pet:updated', result);
      if (result.events?.length) {
        io.to(`user:${result.user.id}`).emit('pet:notification', result.events);
      }
    }

    return res.json({
      message: `Acción ${action} realizada correctamente.`,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error en acción ${action}.`,
      error: error.message
    });
  }
}

async function feed(req, res) {
  return handleAction(req, res, 'feed');
}

async function play(req, res) {
  return handleAction(req, res, 'play');
}

async function sleep(req, res) {
  return handleAction(req, res, 'sleep');
}

async function wake(req, res) {
  return handleAction(req, res, 'wake');
}


async function talk(req, res) {
  const { text } = req.body || {};
  const voice = makePetVoice(text);
  return handleAction(req, res, 'talk', { text, reply: voice });
}

module.exports = {
  getMyPet,
  feed,
  play,
  sleep,
  wake,
  talk
};