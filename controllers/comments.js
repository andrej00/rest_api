const Comment = require('../models/Comment');
const Topic = require('../models/Topic');

module.exports = {
  add: (req, res) => {
    const {
      text,
      loggedInUserId,
      loggedInName,
      loggedInLastname,
      loggedInEmail,
    } = req.body;
    if (!text.match(/[a-z]/i)) {
      return res.status(400).json({ success: false, message: 'Text must be provided' });
    }
    Topic.findById(req.params.id, (err, topic) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic with specified id does not exist' });
      }
      const newComment = {
        text,
        author: {
          id: loggedInUserId,
          name: loggedInName,
          lastname: loggedInLastname,
          email: loggedInEmail,
        },
      };
      Comment.create(newComment, (err2, comment) => {
        if (err2) {
          return res.json({ success: false, error: err2 });
        }
        topic.comments.push(comment);
        topic.save();
        return res.status(200).json({ success: true, message: 'Comment successfully added' });
      });
    });
  },
  update: (req, res) => {
    req.comment.updateOne({ $set: req.body }, (err) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      return res.status(200).json({ success: true, message: 'Comment updated successfully' });
    });
  },
  delete: (req, res) => {
    Topic.findByIdAndUpdate(req.params.id, {
      $pull: {
        comments: req.params.commentId,
      },
    }, (err, topic) => {
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic with specified id does not exist' });
      }
      if (err) {
        return res.json({ success: false, error: err });
      }
      req.comment.deleteOne((err2) => {
        if (err2) {
          return res.json({ success: false, error: err2 });
        }
        return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
      });
    });
  },
};
