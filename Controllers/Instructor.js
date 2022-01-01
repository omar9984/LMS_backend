const { User } = require("../Models/User");
const { Course } = require("../Models/Course");
const { Activity } = require("../Models/Activity");
const catchAsync = require("../Utils/catchAsync");
const factory = require("../Utils/handlerFactory");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/apiFeatures");

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
// exports.addSyllabus = catchAsync( async(req,res,next)=>{
//     const course = await Course.findById(req.body.course)
//     if (!course) res.status(404).json("No course found!");
//     if (req.params.id != course._id){
//         res.status(401).json("Not Allowed!")
//     }

//     if (req.body.attachment){
//         const url = `${req.protocol}://${req.get('host')}`;
//         console.log("url: ",url)
//         const attachment = req.body.attachment.replace(/^data:image\/[a-z]+;base64,/, '');
//         // attachmentName = await exports.prepareAndSaveImage(
//         // Buffer.from(image, 'base64'),
//         // req.user
//         // );
//         // req.body.imageUrl = `${url}/api/v1/images/users/${imageName}`;
//     }
// })

// exports.prepareAndSaveImage = async function prepareAndSaveImage (
//     bufferImage,
//     user
//   ) {
//     // A1) get image data like the width and height and extension
//     const imageData = sizeOf(bufferImage);
//     const imageSize = Math.min(imageData.width, imageData.height, 300);
//     // A2) manipulate the image to be square
//     const decodedData = await sharp(bufferImage)
//       .resize(imageSize, imageSize, { kernel: 'cubic' })
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     const imageType = sizeOf(decodedData).type;

//     // B) save the image with unique name to the following path
//     const imageName = `${helper.randomStr(20)}-${Date.now()}.${imageType}`;
//     const imagePath = path.resolve(`${__dirname}/../assets/images/users/`);
//     await fs_writeFile(`${imagePath}/${imageName}`, decodedData);

//     return imageName;
//   };
