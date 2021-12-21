const {User} = require('../Models/User')
const {Course} = require('../Models/Course')
const catchAsync = require('../Utils/catchAsync')
const AppError = require('../Utils/appError')
const APIFeatures = require('../Utils/apiFeatures');
const factory = require('../Utils/handlerFactory')

exports.getAllLearners = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find({'type':'learner'}), req.query);
    const doc = await features.query;
    // SEND RESPONSE
    res.status(200).json(doc);
});

exports.getLearner = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find({'type':'learner','_id':req.params.id}), req.query);
    const doc = await features.query;
    // SEND RESPONSE
    res.status(200).json(doc);
});


// course id in req body with name course
exports.addCourse = catchAsync(async (req,res) => {

    let learner = await User.findById(req.params.id)
    if (!learner) return res.status(404).json("learner not found!")
    if (learner.courses.includes(req.body.course)) return res.status(400).json("Already enrolled")
    let learnerupdatedData = {
        $push:{
            courses:req.body.course
        }
    }
    // TODO: make sure that its a learner
    let learnerDoc = await User.findByIdAndUpdate({_id: req.params.id}, learnerupdatedData)
    
    if (!learnerDoc) {
        return next(new AppError('No Learner found with that ID', 404));
    }
    
    let courseupdatedData = {
        $push:{
            learners:req.params.id
        }
    }
    let courseDoc = await Course.findByIdAndUpdate({_id: req.body.course},courseupdatedData)
    
    if (!courseDoc) {
        return next(new AppError('No Course found with that ID', 404));
    }

    res.status(200).json("Added successfully");
})