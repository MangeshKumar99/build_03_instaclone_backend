const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signup, verifyUser, verifyForgot, signin, signout, forgot, reset, isSignedIn, isAuthenticated, checkUser } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
router.param("userId", getUserById);
router.post(
    "/signup",
    [
      check("name")
        .isLength({ min: 3 })
        .withMessage("must be at least 3 chars long"),
      check("email").isEmail().withMessage("email is required"),
      check("password")
        .isLength({ min: 5 })
        .withMessage("must be at least 5 chars long"),
    ],
    signup
  );
router.get("/user/verify/:id/:token",verifyUser);
router.get("/user/reset/:id/:token",verifyForgot);


router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("email is required"),
    check("password").isLength({ min: 1 }).withMessage("password is required"),
  ],
  signin
);

router.post("/forgotpassword",forgot);
router.post("/resetpassword/:email",reset);
router.get("/signout", signout);
router.get("/check/:userId", isSignedIn, isAuthenticated, checkUser);

module.exports = router;