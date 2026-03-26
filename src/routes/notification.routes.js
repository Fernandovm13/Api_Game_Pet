const router = require('express').Router();
const authFirebase = require('../middlewares/authFirebase');
const loadUser = require('../middlewares/loadUser');
const {
  listMyNotifications,
  markAsRead
} = require('../controllers/notification.controller');

router.use(authFirebase);
router.use(loadUser);

router.get('/me', listMyNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;