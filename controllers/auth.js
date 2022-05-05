const User = require("../models/user");
const Token = require("../models/token");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (errors.errors.length != 0) {
    return res.status(422).json({
      error: errors.errors[0].msg,
    });
  }
  
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    if (user) {
      return res.status(422).json({
        error:
          "A user with that email has already registered. Please use a different email..",
      });
    } else {
      const user = new User(req.body);
      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            error: "User not saved to DB",
          });
        }
        const token = new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        });
        token.save((err, token) => {
          if (err) {
            return res.status(400).json({
              error: "Token not saved to DB",
            });
          }
          const message = `${process.env.BASE_URL}/user/verify/${user.id}/${token.token}`;
          sendEmail(user.email, "Verify Email", message)
            .then((data) => {
              if (data == "email sent sucessfully") {
                return res.status(200).json({
                  message: "email sent sucessfully",
                });
              }
              if (data == "email not sent") {
                return res.status(400).json({
                  message: "email not sent",
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    }
  });
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send("Invalid link");

    // await User.updateOne({ _id: user._id, verified: true });
    user.verified=true;
    user.save();
    await Token.findByIdAndRemove(token._id);
    res.send("email verified sucessfully, you can signin now!");
  } catch (error) {
    console.log(error);
    res.status(400).send("An error occured");
  }
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  if (errors.errors.length != 0) {
    return res.status(422).json({
      error: errors.errors[0].msg,
    });
  }
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    if (!user) {
      return res.status(400).json({
        error: "Email does not exists!",
      });
    }
    if (user.authenticate(password) == false) {
      return res.status(400).json({
        error: "Email and password does not match",
      });
    }
    if (user.verified == false) {
      return res.status(400).json({
        error: "Email not verified, pls verify!",
      });
    }
    //Create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //Put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });
    //Send response to front-end
    const { _id, name, email } = user;
    res.json({ token, user: { _id, name, email } });
  });
};

exports.forgot = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    if (!user) {
      return res.status(400).json({
        error: `Email does not exists!`,
      });
    }
    const token = new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    token.save((err, token) => {
      if (err) {
        return res.status(400).json({
          error: "Token not saved to DB",
        });
      }
      const message = `${process.env.BASE_URL}/user/reset/${user.id}/${token.token}`;
      sendEmail(user.email, "Reset Email", message)
        .then((data) => {
          if (data == "email sent sucessfully") {
            return res.status(200).json({
              message: "email sent sucessfully",
            });
          }
          if (data == "email not sent") {
            return res.status(400).json({
              message: "email not sent",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
};

exports.verifyForgot = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send("Invalid link");

    // await User.updateOne({ _id: user._id, reset: true });
    user.reset=true;
    user.save();
    await Token.findByIdAndRemove(token._id);
    res.send("user verified sucessfully, you can reset your password now!");
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

exports.reset = async (req, res) => {
  const email = req.params.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (user.reset == false) {
      return res.status(400).json({
        error: "Email not verified, pls verify!",
      });
    } else {
      let salt = uuidv1();
      let encry_password = crypto.createHmac("sha256", salt).update(password).digest("hex");
      await User.updateOne({ email: email }, { $set: { salt: salt } });
      await User.updateOne({ email: email }, { $set: { encry_password: encry_password } });
      await User.updateOne({ email: email }, { $set: { reset: false } });
      return res.status(200).json({
        message: "Password updated successfully!",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfull..",
  });
};

//Protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});
// Custom middlewares
exports.isAuthenticated = (req, res, next) => {
  //Through frontend we are going to set up a property inside user called profile.
  //This property is only going to set if the user is logged in
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};
