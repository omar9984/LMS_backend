const { User } = require("../Models/User");
const { Course } = require("../Models/Course");
const { Activity } = require("../Models/Activity");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/apiFeatures");
// this  is the file were general info controllers are put that
// relate to both learners and instructors
exports.getMyProfile = catchAsync(async (req, res, next) => {
  res.status(200).json(req.user);
});
exports.search = catchAsync(async (req, res, next) => {
  let search_term = req.body.email || "*";

  let query = User.find({});
  if (req.body.email && req.body.email != "") {
    query = User.find({ email: { $regex: `^${search_term}*` } });
  }
  const features = new APIFeatures(query, req.query).filter().offset();

  let users = await features.query;
  res.status(200).json({ users: users });
});
