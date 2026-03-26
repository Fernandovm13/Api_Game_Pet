const router = require('express').Router();
const authFirebase = require('../middlewares/authFirebase');
const loadUser = require('../middlewares/loadUser');
const { registerToken } = require('../controllers/device.controller');

router.use(authFirebase);
router.use(loadUser);

router.post('/token', registerToken);

module.exports = router;