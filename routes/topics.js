const express = require('express');
const { authenticateUser, isMyTopic } = require('../middleware/index');
const topicController = require('../controllers/topics');

const router = express.Router();

router.get('/', authenticateUser, topicController.getAll);
router.post('/', authenticateUser, topicController.add);
router.get('/search/topic', authenticateUser, topicController.searchByTopicTitle);
router.get('/search/comment', authenticateUser, topicController.searchByCommentText);
router.get('/:id', authenticateUser, topicController.getById);
router.put('/:id', authenticateUser, isMyTopic, topicController.update);
router.delete('/:id', authenticateUser, isMyTopic, topicController.delete);

module.exports = router;
