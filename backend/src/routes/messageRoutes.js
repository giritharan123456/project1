const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/messageController');

const router = express.Router();

router.use(requireAuth);
router.get('/', ctrl.getMessages);
router.post('/', ctrl.createMessage);

module.exports = router;
