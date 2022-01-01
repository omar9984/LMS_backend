const { User } = require("../Models/User");
const { Course } = require("../Models/Course");
const { Activity } = require("../Models/Activity");
const catchAsync = require("../Utils/catchAsync");
const factory = require("../Utils/handlerFactory");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/apiFeatures");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "Resources/files" });

exports.getAllInstructors = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    User.find({ type: "instructor" }),
    req.query
  );
  const doc = await features.query;
  // SEND RESPONSE
  res.status(200).json(doc);
});

exports.getInstructor = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    User.find({ type: "instructor", _id: req.params.id }),
    req.query
  );
  const doc = await features.query;
  // SEND RESPONSE
  res.status(200).json(doc);
});

exports.getSeveralInstructors = factory.getMany(User);

exports.createCourse = catchAsync(async (req, res, next) => {
  const course = await Course.create({
    name: req.body.name,
    instructor: req.user.id,
  });

  if (!course) return res.status(400).json("can't create new course");
  let updatedData = {
    $push: {
      courses: course._id,
    },
  };
  const doc = await User.findByIdAndUpdate({ _id: req.user.id }, updatedData);

  if (!doc) {
    return next(new AppError("No instructor found with that ID", 404));
  }

  res.status(200).json("created successfully");
});

exports.removeCourse = catchAsync(async (req, res, next) => {
  //
  // const features = new APIFeatures(
  //   User.find({ type: "instructor", _id: req.params.id }),
  //   req.query
  // );
  // const doc = await features.query;
  // TODO: remove the course
  res.status(200).json("removed successfully");
});

exports.addSyllabus = catchAsync(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) res.status(404).json("No course found!");
  if (req.user.id != course.instructor) {
    res.status(401).json("Not Authorized, course has another instructor!");
  }

  if (!req.file && !req.body.attachmentPath) {
    res.status(400).json("No file or link attached");
  }

  if (req.file) {
    // Renaming file
    const oldPath = path.resolve(
      `${__dirname}/../Resources/files/${req.file.filename}`
    );
    const newPath = path.resolve(
      `${__dirname}/../Resources/files/${req.file.originalname}`
    );
    fs.rename(oldPath, newPath, function (err) {
      if (err) res.status(500).json("formatting file failed");
    });
    req.body.attachmentPath = `Resources/files/${req.file.originalname}`;
  }

  const activity = await Activity.create({
    name: req.body.name,
    attachmentPath: req.body.attachmentPath,
  });

  if (!activity) res.status(500).json("creating Syllabus failed");

  let updatedData = {
    $push: {
      syllabus: activity._id,
    },
  };

  let doc = await Course.findByIdAndUpdate(course._id, updatedData);
  res.status(200).send("OK!");
});
