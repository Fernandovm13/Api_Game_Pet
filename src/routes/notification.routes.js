const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authFirebase = require('../middlewares/authFirebase');

const router = express.Router();

router.post('/send-test', authFirebase, notificationController.sendTestNotification);

module.exports = router;
