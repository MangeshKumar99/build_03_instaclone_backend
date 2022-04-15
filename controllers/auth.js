const User = require("../models/user");
const Token = require("../models/token");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
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
        err: "User not saved to DB",
      });
    }
    if (user) {
      return res.status(422).json({
        err:
          "A user with that email has already registered. Please use a different email..",
      });
    } else {
      const user = new User(req.body);
      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            err: "User not saved to DB",
          });
        }
        const token = new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        });
        token.save((err, token) => {
          if (err) {
            return res.status(400).json({
              err: "Token not saved to DB",
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

    await User.updateOne({ _id: user._id, verified: true });
    await Token.findByIdAndRemove(token._id);
    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("An error occured");
  }
};
