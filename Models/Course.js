const mongoose = require('mongoose')


/**
 * @module Models.Course
 */


 const question = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'please provide a title for your Question'],
        minlength: 2,
        maxlength: 255
    },
    description: {
        type: String,
        required: [true, 'please provide a description for your Question'],
        minlength: 2,
        maxlength: 1000
    },
    replies:[{
        type: String,
        minlength: 2,
        maxlength: 1000
    }]
 })

 const syllabus = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'please provide a title for your Syllabus'],
        minlength: 2,
        maxlength: 500
    },
    activities:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Activity'
    }]
 })
 
 const courseSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        unique: [true, 'course name already exists'],
        required: [true, 'please provide a name for your course'],
        minlength: 2,
        maxlength: 255
      },
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Instructor',
        required: [true, 'course must have instructor']
      },
      questions: [question],
      learners:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Learner'
      }],
      syllabus: [syllabus]
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );
  
  const Course = mongoose.model('Course', courseSchema);
  //module.exports = {Course,question,syllabus};
  module.exports = Course;