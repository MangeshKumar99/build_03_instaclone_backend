const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated} = require("../controllers/auth");
const { getUserById, updateFollow, getAUser, searchUsers } = require("../controllers/user");
router.param("userId", getUserById);
router.get("/user/:userId",getAUser);
router.get("/user/update/follow/:userId/:userId2",isSignedIn, isAuthenticated, updateFollow);
router.get("/user/search/:userId/:name",isSignedIn, isAuthenticated, searchUsers);



module.exports = router;