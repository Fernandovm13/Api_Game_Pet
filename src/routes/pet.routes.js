const router = require('express').Router();
const authFirebase = require('../middlewares/authFirebase');
const loadUser = require('../middlewares/loadUser');
const {
  getMyPet,
  feed,
  play,
  sleep,
  wake,
  talk
} = require('../controllers/pet.controller');

router.use(authFirebase);
router.use(loadUser);

router.get('/me', getMyPet);
router.post('/me/actions/feed', feed);
router.post('/me/actions/play', play);
router.post('/me/actions/sleep', sleep);
router.post('/me/actions/wake', wake);
router.post('/me/actions/talk', talk);

module.exports = router;