const express = require('express');
const rankingController = require('../controllers/ranking.controller');
const authFirebase = require('../middlewares/authFirebase');

const router = express.Router();

router.get('/global', authFirebase, rankingController.getGlobal);

module.exports = router;
