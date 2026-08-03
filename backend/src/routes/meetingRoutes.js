const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/meetingController');

const router = express.Router();

router.use(requireAuth);
router.get('/', ctrl.getMeetings);
router.get('/:id', ctrl.getMeetingById);
router.post('/', ctrl.createMeeting);
router.put('/:id', ctrl.updateMeeting);
router.delete('/:id', ctrl.deleteMeeting);

module.exports = router;
