const mongoose = require('mongoose')


/**
 * @module Models.Activity
 */

 
 const activitySchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'please provide a name for your activity'],
        minlength: 2,
        maxlength: 255
      },
      attachmentPath: String,
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );
  
  const Activity = mongoose.model('Activity', activitySchema);
  module.exports = Activity;