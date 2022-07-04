const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 64,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    photo: {
     type: String
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: []
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    }
 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
