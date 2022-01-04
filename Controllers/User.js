const { User } = require("../Models/User");
const { Course } = require("../Models/Course");
const { Activity } = require("../Models/Activity");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/apiFeatures");
const _ = require("lodash")
const bcrypt = require("bcrypt");
// this  is the file were general info controllers are put that
// relate to both learners and instructors
exports.getMyProfile = catchAsync(async (req, res, next) => {
  res.status(200).json(req.user);
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  
  let user = await User.findById(req.user.id)
  let changed = _.pick(req.body.body,["firstName","lastName","password"])
  if(changed.firstName == "") changed.firstName = user.firstName
  if(changed.lastName == "") changed.lastName = user.lastName
  if(changed.password == ""){
    changed.password = user.password
  }else{
    if(changed.password.length < 8) res.status(400).json("password should be more than 8 characters")
    changed.password = await bcrypt.hash(changed.password, 12);
  }

  let doc = await User.findByIdAndUpdate(req.user.id,changed)
  if (!doc) res.status(500).json("failed to update")
  res.status(200).json("updated successfully")

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
    res.status(401).json({ error: "you are not authorized" });
    return;
  }
  
  // check if upgrading from learner to instructor
  if (req.body.type == "instructor"){
    const learner = await User.findById(req.body.id);
    
    for (const course of learner.courses) {
      let courseUpdatedData = {
        $pull: {
          learners: req.body.id,
        },
      };
      await Course.findByIdAndUpdate(
        { _id: course._id },
        courseUpdatedData
      );
    };

    // changing instructor type
    let updatedData = {
      $set: {
        type: "instructor",
        courses: [],
      },
    };
    let doc = await User.findByIdAndUpdate(req.body.id, updatedData);
  
    if (!doc) {
      res.status(500).json("upgrading failed!");
    }
    res.status(200).json("successfully upgraded");
  }
    // check if downgrading from instructor to learner
  else if (req.body.type == "learner"){
    const instructor = await User.findById(req.body.id);

    for (const courseId of instructor.courses) {
        
      // Removing course from learners' enrollement courses 
      let course = await Course.findById(courseId)
      for (const learner of course.learners) {
        let learnerUpdatedData = {
          $pull: {
            courses: courseId,
          },
        };
        await User.findByIdAndUpdate(learner,learnerUpdatedData);
      };

      // Remove Course
      await Course.findByIdAndRemove(course._id)
    };

    // changing learner type
    let updatedData = {
      $set: {
        type: req.body.type,
        courses: [],
      },
    };
    let doc = await User.findByIdAndUpdate(req.body.id, updatedData);
  
    if (!doc) {
      res.status(500).json("downgrading failed!");
    }
    res.status(200).json("successfully downgraded");
  }

});
