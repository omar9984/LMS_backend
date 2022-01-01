const _ = require("lodash");
const { User, validate } = require("../Models/User");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const createSendToken = (user, statusCode, res) => {
  const token = user.signToken();
  // Remove password from output
  //user.password = undefined;
  res.status(statusCode).json({
    token, //,
    // user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // User.updateMany({}, {$unset: {words:1}} , {multi: true});
  // validate with JOI as a first layer of validation
  await validate(req.body);
  // insert the user data in the database
  const newUser = await User.create({
    ..._.pick(req.body, [
      "email",
      "password",
      "passwordConfirm",
      "birthdate",
      "type",
      "lastName",
      "firstName",
    ]),
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.checkEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // Check if email exists
  if (!email) {
    return next(new AppError("Please provide an email to check", 400));
  }
  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ exists: false });
  }
  // If everything ok, send type of user to client
  res.status(200).json({ exists: true, type: user.type });
});

exports.restrictTo = (...types) => {
  return (req, res, next) => {
    if (!types.includes(req.user.type)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.protect = (blocking) => {
  return catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      if (blocking)
        return next(
          new AppError(
            "You are not logged in! Please log in to get access.",
            401
          )
        );
      else return next();
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  });
};
