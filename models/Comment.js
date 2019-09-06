const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const commentSchema = new Schema({
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
});

module.exports = model('Comment', commentSchema);
