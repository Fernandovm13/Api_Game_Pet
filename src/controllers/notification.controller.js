const {
  listNotificationsByUserId,
  markNotificationAsRead
} = require('../repositories/notification.repository');

async function listMyNotifications(req, res) {
  try {
    const notifications = await listNotificationsByUserId(req.dbUser.id);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({
      message: 'Error listando notificaciones.',
      error: error.message
    });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const ok = await markNotificationAsRead(Number(id), req.dbUser.id);

    return res.json({
      message: ok ? 'Notificación marcada como leída.' : 'No se encontró la notificación.',
      success: ok
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error actualizando notificación.',
      error: error.message
    });
  }
}

module.exports = {
  listMyNotifications,
  markAsRead
};