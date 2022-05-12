const User = require("../models/user");
exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found in DB",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getAUser = async(req,res) => {
  try {
    const user = await User.findOne({_id:req.profile._id});
    res.status(200).json(user);
  } catch (error) {
    res.json({error:error});
  }
}

exports.incrementPostCount = async(req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.profile._id });
    let postsCount = user.postsCount;
    postsCount = postsCount + 1;
    user.postsCount = postsCount;
    await user.save();
    next();
  } catch (error) {
    next(error);
  }
}

exports.decrementPostCount = async(req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.profile._id });
    let postsCount = user.postsCount;
    postsCount = postsCount - 1;
    user.postsCount = postsCount;
    await user.save();
    next();
  } catch (error) {
    next(error);
  }
}

exports.updateFollow = async(req,res) =>{
  try {
    //user1 which is following
    const user1 = await User.findOne({ _id: req.params.userId1 });
    //user2 which is followed
    const user2 = await User.findOne({ _id: req.params.userId2 });

    if (user2.followers.includes(user1.email)) {
      const index = user2.followers.indexOf(user1.email);
      if (index > -1) {
        user2.followers.splice(index, 1);
        user1.following.splice(user1.following.indexOf(user2.email),1);
      }
    }
    else{
      user2.followers.push(user1.email);
      user1.following.push(user2.email);
    }
    await user1.save();
    await user2.save();
    res.status(200).json({message:"Successfully updated"})

  } catch (error) {
    res.status(400).json({error:error});
  }
}

