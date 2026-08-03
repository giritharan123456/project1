const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const router = express.Router();

router.use(requireAuth);
router.get('/', ctrl.getUsers);
router.get('/online', ctrl.getOnlineUsers);
router.get('/departments', ctrl.getDepartments);
router.get('/:id', ctrl.getUserById);
router.put('/:id', ctrl.updateUser);

module.exports = router;
