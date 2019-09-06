const express = require('express');
const { authenticateUser, isMyComment } = require('../middleware/index');
const commentController = require('../controllers/comments');

const router = express.Router({ mergeParams: true });

router.post('/', authenticateUser, commentController.add);
router.put('/:commentId', authenticateUser, isMyComment, commentController.update);
router.delete('/:commentId', authenticateUser, isMyComment, commentController.delete);

module.exports = router;
