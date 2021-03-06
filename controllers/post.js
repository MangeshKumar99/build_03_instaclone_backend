const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
const { v1: uuidv1 } = require("uuid");
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret,
  secure: true
});

exports.getPostById = (req, res, next, id) => {
  Post.findById(id).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: "Post not found in DB",
      });
    }
    req.post = post;
    next();
  });
};

exports.updatePost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    let post = req.post;
    post = _.extend(post, fields);
    cloudinary.uploader.upload(file.photo.path, (error,result)=>{
      if(error){
        return res.status(400).json({error:error})
      }
      else{
        const {url} = result;
        if (file.photo) {
          if (file.photo.size > 3000000) {
            return res.status(400).json({
              error: "File size too big!",
            });
          }
        }
        if (req.profile) {
          post.postedBy = req.profile;
        }
        post.photo = url;
        post.save((err, post) => {
          if (err) {
            return res.status(400).json({
              error: "Post not saved to DB",
            });
          }
          return res.status(200).json({message:"Post updated successfully!"});
        });
      }
    })
   
  });
};

exports.deletePost = (req, res) => {
  Post.findByIdAndRemove(req.post._id, (err, post) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the post",
      });
    }
    return res.status(200).json({
      message: "Post successfully deleted",
    });
  });
};

exports.createPost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    cloudinary.uploader.upload(file.photo.path, (error,result)=>{
      if(error){
        return res.status(400).json({error:error})
      }
      else{
        const {url} = result;
        const post = new Post(fields);
        if (file.photo) {
          if (file.photo.size > 3000000) {
            return res.status(400).json({
              error: "File size too big!",
            });
          }
        }
        if (req.profile) {
          post.postedBy = req.profile;
        }
        post.photo = url;
        post.save((err, post) => {
          if (err) {
            return res.status(400).json({
              error: "Post not saved to DB",
            });
          }
          return res.status(200).json({message:"Post created successfully!"});
        });
      }
    })
  });
};

exports.getAllPosts = (req, res) => {
  Post.find({})
    .populate("User")
    .populate("postedBy")
    .exec((err, result) => {
      if (err) {
        return res.json({ error: err });
      }
      result=excludePassword(result);
      res.json({ result: result });
    });
};

excludePassword = (result) =>{
  for(let i=0;i<result.length;i++){
    result[i].postedBy.encry_password = undefined;
  }
  return result;
}

exports.createComment = async (req, res) => {
  try {
    let commentObj = {};
    commentObj["_id"] = uuidv1();
    commentObj["comment"] = req.body.comments;
    commentObj["commentedBy"] = req.profile.name;
    const post = await Post.findOne({ _id: req.params.postId });
    post.comments.push(commentObj);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    // You can use both req.post._id or req.params.postId
    const post = await Post.findOne({ _id: req.params.postId }); 
    const filteredCommentsArray = post.comments.filter(
      (item) => item._id !== req.params.commentId
    );
    post.comments = filteredCommentsArray;
    await post.save();
    res.status(200).json({
      message:"Comment deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    for (let i = 0; i < post.comments.length; i++) {
      if (post.comments[i]._id == req.params.commentId) {
        post.comments[i].comment = req.body.comments;
        break;
      }
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (post.likes.includes(req.profile.email)) {
      const index = post.likes.indexOf(req.profile.email);
      if (index > -1) {
        post.likes.splice(index, 1); 
      }
    }
    else{
      post.likes.push(req.profile.email);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.getPhoto = (req, res, next) => {
  if (req.post.photo.data) {
    res.set("Content-Type", req.post.photo.contentType);
    return res.send(req.post.photo.data);
  }
  next();
};




