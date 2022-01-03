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

  // Check current user to be Admin
  if (req.user.type.toLowerCase() != "admin") {
    res.status(40).json({ error: "you are not authorized" });
    return;
  }

  // check if upgrading from learner to instructor
  if (req.body.type == "instructor"){
    const learner = await User.findById(req.body.id);

    learner.courses.forEach(course => {
      let courseUpdatedData = {
        $pull: {
          learners: req.body.id,
        },
      };
      await Course.findByIdAndUpdate(
        { _id: course._id },
        courseUpdatedData
      );
    });

    // changing instructor type
    let updatedData = {
      $set: {
        type: "instructor",
        courses: [],
      },
    };
    learner = await User.findByIdAndUpdate(req.body.id, updatedData);
  
    if (!learner) {
      res.status(500).json("upgrading failed!");
    }
    res.status(200).json("successfully upgraded");

  } // check if downgrading from instructor to learner
  else if (req.body.type == "learner"){
    const instructor = await User.findById(req.body.id);

    instructor.courses.forEach(course => {

      // Removing course from learners' enrollement courses 
      course.learners.forEach(learner => {
        let learnerUpdatedData = {
          $pull: {
            courses: course._id,
          },
        };
        await User.findByIdAndUpdate(
          { _id: learner._id },
          learnerUpdatedData
        );
      });

      // Remove Course
      await Course.findByIdAndRemove(course._id)
    });

    // changing learner type
    let updatedData = {
      $set: {
        type: req.body.type,
        courses: [],
      },
    };
    instructor = await User.findByIdAndUpdate(req.body.id, updatedData);
  
    if (!instructor) {
      res.status(500).json("downgrading failed!");
    }
    res.status(200).json("successfully downgraded");
  }

});
