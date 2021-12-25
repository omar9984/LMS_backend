const {Course} = require('../Models/Course')
const {Question} = require('../Models/Question')
const {User} = require('../Models/User')
const catchAsync = require('../Utils/catchAsync')
const APIFeatures = require('../Utils/apiFeatures');
const factory = require('../Utils/handlerFactory');

exports.getAllCourses = catchAsync(async (req, res) => {
    const features = new APIFeatures(Course.find({}), req.query);
    const doc = await features.query;
    // SEND RESPONSE
    res.status(200).json(doc);
});

exports.getCourse = factory.getOne(Course);

exports.getSeveralCourses = factory.getMany(Course);

exports.getSeveralQuestions = factory.getMany(Question);

exports.addQuestion = catchAsync(async (req,res) =>{
    // which course
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json("course not found")
    
    // if authorized or not (admin, my instructor, my learners)
    const user = await User.findById(req.user.id)

    if(!user) return res.status(404).json("user not found")
    
    if (user.type == "learner"){
        if(!course.learners.includes(user._id)) return res.status(401).json("not authorized, Please enroll in the course");
    }

    if (user.type == "instructor"){
        if(!course.instructor.equals(user._id)) return res.status(401).json("not authorized, Course belongs to another instructor");
    }

    let questionData = {
        author:req.user.id,
        title:req.body.title,
        description:req.body.description,
        course:req.params.id,
        createdAt:Date.now()
    }
    const question = await Question.create(questionData)
    
    if(!question) return res.status(400).json("failed to create question")
    let updatedData = {
        $push:{
            questions:question._id
        }
    }
    const doc = await Course.findByIdAndUpdate(req.params.id,updatedData)

    
    if (!doc) {
        return res.status(500).json("request failed")
    }

    res.status(200).json("created successfully");
})

exports.deleteQuestion = catchAsync(async (req,res) =>{
    
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json("question not found")
    // which course
    const course = await Course.findById(question.course)
    if (!course) return res.status(404).json("course not found")
    
    // if authorized or not (admin, my instructor, my learners)
    if (!req.user.id) return res.status(400).json("please, add the user");

    const user = await User.findById(req.user.id)
    if (!user) return res.status(400).json("user not found");
    
    if(!course.instructor.equals(user._id) && user.type != 'admin') return res.status(401).json("not authorized, Course belongs to another instructor");
    
    let updatedData = {
        $pull:{
            questions:question._id
        }
    }
    let doc = await Course.findByIdAndUpdate(course._id,updatedData)

    
    if (!doc) {
        return res.status(500).json("failed to remove question from course");
    }

    doc = await Question.remove({_id:question._id})

    if (!doc) {
        return res.status(500).json("failed to delete question");
    }


    res.status(200).json("deleted successfully");
})

exports.addReply = catchAsync(async (req,res) =>{
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json("question not found")
    
    // which course
    const course = await Course.findById(question.course)

    // if authorized or not (admin, my instructor, my learners)
    if (!req.user.id || !req.body.reply){
        return res.status(400).json("please, add the user and reply");
    }

    const user = await User.findById(req.user.id)

    if(!user) return res.status(404).json("user not found")
    
    if (user.type == "learner"){
        if(!course.learners.includes(user._id)) return res.status(401).json("not authorized, Please enroll in the course");
    }
    
    if (user.type == "instructor"){
        if(!course.instructor.equals(user._id)) return res.status(401).json("not authorized, Course belongs to another instructor");
    }

    let reply = {
        "description":req.body.reply,
        "author":req.user.id
    }

    let updatedData = {
        $push:{
            replies:reply
        }
    }
    const doc = await Question.findByIdAndUpdate(question._id,updatedData)
    
    if (!doc) {
        return res.status(500).json("failed to add reply");
    }

    res.status(200).json("added successfully");

});
