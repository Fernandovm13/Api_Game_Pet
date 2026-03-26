const router = require('express').Router();
const { firebaseAuth } = require('../controllers/auth.controller');

router.post('/firebase', firebaseAuth);

module.exports = router;