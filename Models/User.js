const mongoose = require('mongoose')
const validator = require('validator');


/**
 * @module Models.User
 */

const baseOptions = {
    discriminatorKey: 'type', // our discriminator key
    collection: 'User', // the name of our collection
  };
  
  // Our Base schema: these properties will be shared with our "real" schemas
  const User = mongoose.model('User', new mongoose.Schema({
        username:{
            type:String,
            unique:[true,'this username is already used'],
            required:[true,"please provide your username"],
            minlength: 2,
            maxlength: 255
        },
        password:{
            type:String,
            required:[true,"please provide your password"],
            minlength: 2,
            maxlength: 255
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
              // This only works on CREATE and SAVE!
              validator: function (el) {
                return el === this.password;
              },
              message: 'Passwords are not the same!'
            }
          },
        email: {
            type: String,
            required: [true, 'please provide your email'],
            minlength: 5,
            maxlength: 255,
            unique: [true, 'this email is already used'],
            lowercase: true,
            validate: [validator.isEmail, 'please enter a valid email']
          },
        firstName:{
            type:String,
            required:[true,"firstName is required"],
            minlength: 2,
            maxlength: 255
        },
        lastName:{
            type:String,
            required:[true,"lastName is required"],
            minlength: 2,
            maxlength: 255
        },
        birthdate:{
            type:Date,
            min: '1-1-1900',
            max: '1-1-2010',
            required: [true, 'please provide your date of birth']
        }
      }, baseOptions,
    ),
  );
  
  const Instructor = User.discriminator('Instructor', new mongoose.Schema({
    courses: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref:'Course'
    }],
  }),
);

const Learner = User.discriminator('Learner', new mongoose.Schema({
    courses: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref:'Course'
    }],
  }),
);

const Admin = User.discriminator('Admin');

const Guest = User.discriminator('Guest');

module.exports = {User,Instructor,Learner,Admin,Guest};