const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/recordingController');

const router = express.Router();

router.use(requireAuth);
router.get('/', ctrl.getRecordings);
router.get('/:id', ctrl.getRecordingById);
router.put('/:id', ctrl.updateRecording);
router.delete('/:id', ctrl.deleteRecording);

module.exports = router;
