const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signup, verifyUser } = require("../controllers/auth");

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

module.exports = router;