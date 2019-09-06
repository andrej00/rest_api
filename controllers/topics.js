const Topic = require('../models/Topic');
const Comment = require('../models/Comment');

module.exports = {
  getAll: (req, res) => {
    const pagination = req.query.pagination ? parseInt(req.query.pagination, 10) : 0;
    Topic
      .find()
      .limit(pagination)
      .populate('comments')
      .exec((err, topics) => {
        if (err) {
          return res.json({ success: false, error: err });
        }
        return res.status(200).json({ success: true, message: 'Topics found', topics });
      });
  },
  add: (req, res) => {
    const {
      title,
      text,
      loggedInUserId,
      loggedInName,
      loggedInLastname,
      loggedInEmail,
    } = req.body;
    if (!(title.match(/[a-z]/i) && text.match(/[a-z]/i))) {
      return res.status(400).json({ success: false, message: 'Both title and the text must be provided' });
    }
    const newTopic = new Topic({
      title,
      text,
      author: {
        id: loggedInUserId,
        name: loggedInName,
        lastname: loggedInLastname,
        email: loggedInEmail,
      },
    });
    newTopic.save((err, topic) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      return res.status(200).json({ success: true, message: 'Topic added successfully', data: topic });
    });
  },
  getById: (req, res) => {
    Topic
      .findById(req.params.id)
      .populate('comments')
      .exec((err, topic) => {
        if (err) {
          return res.json({ success: false, error: err });
        }
        if (!topic) {
          return res.status(404).json({ success: false, message: 'Topic with specified id does not exist' });
        }
        return res.status(200).json({ message: 'Topic found', topic });
      });
  },
  update: (req, res) => {
    const {
      title,
      text,
    } = req.body;
    if (!(title.match(/[a-z]/i) && text.match(/[a-z]/i))) {
      return res.status(400).json({ success: false, message: 'Both title and the text must be provided' });
    }
    const { topic } = req;
    topic.title = title;
    topic.text = text;
    topic.save((err) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      return res.status(200).json({ success: true, message: 'Topic updated successfully' });
    });
  },
  delete: (req, res) => {
    const { topic } = req;
    Comment.deleteMany({ _id: { $in: topic.comments } }, (err) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      topic.deleteOne((err2) => {
        if (err2) {
          return res.json({ success: false, error: err2 });
        }
        return res.status(200).json({ success: true, message: 'Topic deleted successfully' });
      });
    });
  },
  searchByTopicTitle: (req, res) => {
    if (!req.body.title.match(/[a-z]/i)) {
      return res.status(400).json({ success: false, message: 'Title must be provided' });
    }
    const query = {
      title: new RegExp(req.body.title, 'i'),
    };
    Topic.find(query)
      .populate('comments')
      .exec((err, topics) => {
        if (err) {
          return res.json({ success: false, message: 'Search failed', error: err });
        }
        return res.status(200).json({ success: true, message: 'Successful search', topics });
      });
  },
  searchByCommentText: (req, res) => {
    if (!req.body.text.match(/[a-z]/i)) {
      return res.status(400).json({ success: false, message: 'Text must be provided' });
    }
    Topic.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
        },
      },
      { $unwind: '$comments' },
      {
        $group: {
          author: { $first: '$author' },
          comments: { $push: '$comments' },
          _id: '$_id',
          title: { $first: '$title' },
          text: { $first: '$text' },
          __v: { $first: '$__v' },
        },
      },
      { $match: { 'comments.text': { $regex: new RegExp(req.body.text, 'i') } } },
    ]).exec((err, topics) => {
      if (err) {
        return res.json({ success: false, message: 'Search failed', error: err });
      }
      return res.status(200).send({ success: true, message: 'Search successful', topics });
    });
  },
};
