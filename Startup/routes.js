const express = require("express");
const instructorRouter = require("../Routes/Instructor");
const courseRouter = require("../Routes/Course");
const learnerRouter = require("../Routes/Learner");
const authRouter = require("../Routes/Auth");
const userRouter = require("../Routes/User");
const AppError = require("../utils/appError");
const bodyParser = require("body-parser");
const auth = require("../Controllers/Auth");
const globalErrorHandler = require("../controllers/errorController");

module.exports = function (app) {
  app.set("trust proxy", "loopback"); // for deployment to get the host in the code
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  app.use(
    bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
      limit: "50mb",
    })
  );
  app.use("/", authRouter);
  app.use("/instructor", instructorRouter);
  app.use("/course", courseRouter);
  app.use("/learner", learnerRouter);
  app.use("/user", userRouter);
  app.use("/Resources",express.static('Resources'))
  app.get("/auth-ping", auth.protect(true), (req, res) =>
    res.send("connected")
  );

  app.use(globalErrorHandler);
};
