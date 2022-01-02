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
  let search_term = req.query.email || "*";
  delete console.log("search term is ", search_term);
  let query = User.find({});
  if (req.query.email && search_term != "") {
    query = User.find({ email: { $regex: `^${search_term}*` } });
    // query = User.find({});
  }
  delete req.query["email"];
  const features = new APIFeatures(query, req.query).filter().offset();

  let users = await features.query;
  res.status(200).json({ users: users });
});

exports.change_type = catchAsync(async (req, res, next) => {
  if (req.user.type.toLowerCase() != "admin") {
    res.status(40).json({ error: "you are not authorized" });
    return;
  }
  let new_user = await User.findByIdAndUpdate(req.body.id, {
    type: req.body.type,
  });

  res.status(200).json(new_user);
});
