const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {createPost, getAllPosts, createComment, getPostById, updatePost, deletePost, deleteComment, updateComment, getLikes} = require("../controllers/post");



router.param("userId", getUserById);
router.param("postId", getPostById);
router.post("/post/create/:userId", isSignedIn, isAuthenticated ,createPost);
router.put("/post/:postId/:userId",isSignedIn, isAuthenticated, updatePost);
router.delete("/post/:postId/:userId",isSignedIn, isAuthenticated, deletePost);
router.post("/comment/create/:postId/:userId", isSignedIn, isAuthenticated ,createComment);
router.get("/comment/delete/:commentId/:postId/:userId", isSignedIn, isAuthenticated ,deleteComment);
router.post("/comment/update/:commentId/:postId/:userId", isSignedIn, isAuthenticated ,updateComment);
router.get("/post/like/:postId/:userId",isSignedIn, isAuthenticated ,getLikes)
router.get("/posts", getAllPosts);




module.exports=router;