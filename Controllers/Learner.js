const { User } = require("../Models/User");
const { Course } = require("../Models/Course");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/apiFeatures");
const factory = require("../Utils/handlerFactory");
const { array } = require("joi");

exports.getAllLearners = catchAsync(async (req, res) => {
  const features = new APIFeatures(User.find({ type: "learner" }), req.query);
  const doc = await features.query;
  // SEND RESPONSE
  res.status(200).json(doc);
});

exports.getLearner = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    User.find({ type: "learner", _id: req.params.id }),
    req.query
  );
  const doc = await features.query;
  // SEND RESPONSE
  res.status(200).json(doc);
});

exports.getSeveralLearners = factory.getMany(User);

// course id in req params
exports.addCourse = catchAsync(async (req, res) => {
  console.log(req.body);

  let course = await Course.findOne({ name: req.body.name });

  let learner = await User.findById(req.user.id);
  if (!learner) return res.status(404).json("learner not found!");
  if (learner.courses.includes(req.params.id))
    return res.status(400).json("Already enrolled");
  let learnerupdatedData = {
    $push: {
      courses: course._id,
    },
  };
  // TODO: make sure that its a learner
  let learnerDoc = await User.findByIdAndUpdate(
    { _id: req.user.id },
    learnerupdatedData
  );

  if (!learnerDoc) {
    return next(new AppError("No Learner found with that ID", 404));
  }

  let courseupdatedData = {
    $push: {
      learners: req.user.id,
    },
  };
  let courseDoc = await Course.findByIdAndUpdate(
    { _id: course._id },
    courseupdatedData
  );

  if (!courseDoc) {
    return next(new AppError("No Course found with that ID", 404));
  }

  res.status(200).json("Added successfully");
});

exports.leaveCourse = catchAsync(async (req, res) => {
  let learner = await User.findById(req.user.id);
  if (!learner) return res.status(404).json("learner not found!");
  if (!learner.courses.includes(req.params.id))
    return res.status(400).json("Already Not Enrolled");
  let learnerupdatedData = {
    $pull: {
      courses: req.params.id,
    },
  };
  // TODO: make sure that its a learner
  let learnerDoc = await User.findByIdAndUpdate(
    { _id: req.user.id },
    learnerupdatedData
  );

  if (!learnerDoc) {
    return next(new AppError("No Learner found with that ID", 404));
  }

  let courseupdatedData = {
    $pull: {
      learners: req.user.id,
    },
  };
  let courseDoc = await Course.findByIdAndUpdate(
    { _id: req.params.id },
    courseupdatedData
  );

  if (!courseDoc) {
    return next(new AppError("No Course found with that ID", 404));
  }

  res.status(200).json("UnEnrolled successfully");
});

exports.upgradeLearner = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json("user not found");
  }
  if (user.type != "admin") {
    res.status(401).json("you're not authourized!");
  }
  let updatedData = {
    $set: {
      type: "instructor",
      courses: [],
    },
  };
  const learner = await User.findByIdAndUpdate(req.params.id, updatedData);

  if (!learner) {
    res.status(500).json("upgrading failed!");
  }
  res.status(200).json("successfully upgraded");
});

exports.exploreCourses = catchAsync(async (req, res) => {
  const learner = await User.findOne({ type: "learner", _id: req.user.id });
  if (!learner) res.status(404).json("learner not found!");
  const courses = await Course.find({ _id: { $nin: learner.courses } });
  res.status(200).json(courses);
});
