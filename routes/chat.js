
const express = require("express");
const router = express.Router();

const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {createChat, checkIsChatCreated, saveChat} = require("../controllers/chat");
const { getUserById} = require("../controllers/user");

router.param("userId", getUserById);
router.post("/chat/create/:userId", isSignedIn, isAuthenticated,createChat);
router.get("/chat/check/:userId/:userId2", isSignedIn, isAuthenticated,checkIsChatCreated);
router.post("/chat/save/:userId/:chatId",isSignedIn, isAuthenticated,saveChat);

module.exports = router;
