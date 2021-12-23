const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

/**
 * @module Models.User
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, "this username is already used"],
    required: [true, "please provide your username"],
    minlength: 2,
    maxlength: 255,
  },
  password: {
    type: String,
    required: [true, "please provide your password"],
    minlength: 8,
    maxlength: 255,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  email: {
    type: String,
    required: [true, "please provide your email"],
    minlength: 5,
    maxlength: 255,
    unique: [true, "this email is already used"],
    lowercase: true,
    validate: [validator.isEmail, "please enter a valid email"],
  },
  firstName: {
    type: String,
    required: [true, "firstName is required"],
    minlength: 2,
    maxlength: 255,
  },
  lastName: {
    type: String,
    required: [true, "lastName is required"],
    minlength: 2,
    maxlength: 255,
  },
  birthdate: {
    type: Date,
    min: "1-1-1900",
    max: "1-1-2010",
    required: [true, "please provide your date of birth"],
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  type: {
    type: String,
    enum: ["admin", "learner", "instructor"],
    default: "learner",
    required: [true, "please provide your type"],
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  // if password was not modified
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next();

//   /* istanbul ignore next */
//   // to make sure the token is created after the password has been modified
//   // because saving to the database is a bit slower than making the token
//   this.passwordChangedAt = Date.now() - 1000;
//   /* istanbul ignore next */
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.signToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_VALID_FOR,
    }
  );
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model("User", userSchema);

async function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(255).required(),
    birthdate: Joi.date().greater("1-1-1900").less("1-1-2010").required(),
    passwordConfirm: Joi.string().min(8).max(255),
    lastName: Joi.string().min(2).max(255),
    firstName: Joi.string().min(2).max(255),
    type: Joi.string().valid("admin", "instructor", "learner").required(),
  });
  try {
    return await schema.validateAsync(user);
  } catch (err) {
    throw err;
  }
}
exports.User = User;
exports.validate = validateUser;
