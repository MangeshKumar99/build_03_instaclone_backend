const Chat = require("../models/chat");

exports.createChat = async (req, res) => {
  try {
    const chat = new Chat();
    chat.chatInitiatedBy = req.profile._id;
    chat.chatWith = req.body.chatWith;
    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.checkIsChatCreated = async (req, res) => {
  try {
    const chat1 = await Chat.findOne({
      chatInitiatedBy: req.params.userId,
      chatWith: req.params.userId2,
    });
    const chat2 = await Chat.findOne({
      chatInitiatedBy: req.params.userId2,
      chatWith: req.params.userId,
    });
    if (chat1) {
      res.status(200).json(chat1);
    } else if (chat2) {
      res.status(200).json(chat2);
    } else {
      res.status(200).json(false);
    }
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.saveChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId });
    chat.messages.push(req.body);
    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};
