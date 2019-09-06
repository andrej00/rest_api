const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const topicSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    lastname: String,
    email: String,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
});

module.exports = model('Topic', topicSchema);
