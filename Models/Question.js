const mongoose = require('mongoose')

/**
 * @module Models.Question
 */

 const reply = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    description:{
        type: String,
        minlength: 2
    }
 })
 const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'please provide a title for your Question'],
        minlength: 2,
        maxlength: 255
    },
    description: {
        type: String,
        required: [true, 'please provide a description for your Question'],
        minlength: 2
    },
    replies:[reply],
    author:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    createdAt:Date

 });

  const Question = mongoose.model('Question', questionSchema);
  exports.Question = Question;