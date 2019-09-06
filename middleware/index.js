const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
const Topic = require('../models/Topic');

module.exports = {
  authenticateUser: (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.json({ success: false, message: 'No authorization header provided' });
    }
    const [, token] = authorization.split(' ');
    jwt.verify(token, req.app.get('secretKey'), (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: err.message, data: null });
      }
      req.body.loggedInUserId = decoded.id;
      req.body.loggedInName = decoded.name;
      req.body.loggedInLastname = decoded.lastname;
      req.body.loggedInEmail = decoded.email;
      return next();
    });
  },
  isMyTopic: (req, res, next) => {
    Topic.findById(req.params.id, (err, topic) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic with specified id does not exist' });
      }
      const myTopic = topic.author.id.equals(req.body.loggedInUserId);
      if (myTopic) {
        req.topic = topic;
        return next();
      }
      return res.status(403).json({ success: false, message: 'You can only make changes to your topics' });
    });
  },
  isMyComment: (req, res, next) => {
    Comment.findById(req.params.commentId, (err, comment) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      if (!comment) {
        return res.status(404).json({ success: false, message: 'Comment with specified id does not exist' });
      }
      const myComment = comment.author.id.equals(req.body.loggedInUserId);
      if (myComment) {
        req.comment = comment;
        return next();
      }
      return res.status(403).json({ success: false, message: 'You can only make changes to your comments' });
    });
  },
};
