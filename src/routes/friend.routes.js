const express = require('express');
const friendController = require('../controllers/friend.controller');
const authFirebase = require('../middlewares/authFirebase');

const router = express.Router();

router.post('/request', authFirebase, friendController.sendRequest);
router.get('/pending', authFirebase, friendController.invitations);
router.put('/accept', authFirebase, friendController.accept);
router.get('/list', authFirebase, friendController.list);

module.exports = router;
