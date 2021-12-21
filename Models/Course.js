const mongoose = require('mongoose')

/**
 * @module Models.Course
 */

 
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
      learners:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Learner'
      }],
      questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Question'
      }],
      syllabus: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Activity',
      }]
    }
  );

  const Course = mongoose.model('Course', courseSchema);
  exports.Course = Course;