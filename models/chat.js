const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    messages: {
      type: Array,
      default: []
    },
    chatInitiatedBy: {
      type: String
    },
    chatWith:{
      type: String
    }
 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
