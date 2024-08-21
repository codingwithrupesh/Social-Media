// const {json} = require('express')
const User = require("../models/User");

const Post = require("../models/Post");
const { error, success } = require("../utils/responsWrapper");
const { populate } = require("dotenv");
const cloudinary = require("cloudinary").v2;
const mapPostOutput = require("../utils/utils");

const followOrUnfollowUser = async (req, res) => {
  try {
    const { userToFollowId } = req.body;
    // kisko follow karna  hai
    const curUserId = req._id;

    const userToFollow = await User.findById(userToFollowId);
    console.log("userIdToFollow", userToFollowId);
    console.log("user to follow", userToFollow);
    const curUser = await User.findById(curUserId);
    if (curUserId === userToFollowId) {
      return res.send(error(409, "cannot follow yourself"));
    }

    if (!userToFollow) {
      return res.send(error(404, "User Not Found to follow"));
    }

    if (curUser.followings.includes(userToFollowId)) {
      // already followed
      const followingIndex = curUser.followings.indexOf(userToFollowId);
      curUser.followings.splice(followingIndex, 1);
      // curr user ne pahale hi follow kar rakha hai to uske folloing se unfollow matlab
      // splice ho jaga

      // lekin user to follow  ke  follwer se bhi nikalna hoga
      const followerIndex = userToFollow.followers.indexOf(curUser);
      userToFollow.followers.splice(followerIndex, 1);
      await userToFollow.save();
      await curUser.save();
      // return res.send(success(200, "user unfollowed"));
    } else {
      userToFollow.followers.push(curUser);
      curUser.followings.push(userToFollowId);
      await userToFollow.save();
      await curUser.save();
      // return res.send(success(200, "user followed"));
    }

    return res.send(success(200, { userToFollow }));
  } catch (e) {
    console.log("errpr is ->", e);
    return res.send(error(404, e.massage));
  }
};

const getPostOfFollowing = async (req, res) => {
  try {
    const ownerId = req._id;
    const currUser = await User.findById(ownerId).populate("followings");
    const followings = currUser.followings;

    const fullPosts = await Post.find({
      owner: {
        $in: followings,
      },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._iq))
      .reverse();
    const followingsIds = currUser.followings.map((item) => item._id);
    // you can not be suggestion for you
    followingsIds.push(req._id);
    const suggestions = await User.find({
      _id: {
        $nin: followingsIds,
      },
    });
    return res.send(success(200, { ...currUser._doc, suggestions, posts }));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const getMyPost = async (req, res) => {
  try {
    const curUserId = req._id;
    console.log(curUserId);
    const allUserPosts = await Post.find({
      owner: curUserId,
    }).populate("likes"); // for likes user data
    // console.log( "user Post",allUserPosts);
    return res.send(success(200, { allUserPosts }));
  } catch (e) {
    console.log("error is :", e);
    res.send(error(500, e.massage));
  }
};
const getUserPost = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.send(error(400, "userId is required"));
    }

    const allUserPosts = await Post.find({
      owner: userId,
    }).populate("likes"); // for likes user data
    // console.log( "user Post",allUserPosts);
    return res.send(success(200, { allUserPosts }));
  } catch (e) {
    console.log("error is :", e);
    res.send(error(500, e.massage));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);
    console.log("currUser", curUser);
    console.log("currUser", curUserId);

    // delete all post
    Post.deleteMany({
      owner: curUserId,
    });
    // remove myself from followers following
    curUser.followers.forEach(async (followerid) => {
      const follower = await User.findById(followerid);
      const Index = follower.followings.indexOf(curUser);
      follower.followings.splice(Index, 1);
      await follower.save();
    });

    // remove myself following follower
    curUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(curUserId);
      following.followers.splice(index, 1);
      await User.save();
    });

    // remove myself from all likes
    const allPost = await Post.find();
    allPost.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
      await post.save();
    });
    // delete user
    await curUser.deleteOne();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "User Deleted"));
  } catch (e) {
    console.log("error is :", e);
    res.send(error(500, e.massage));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const currUserId = req._id;
    const user = await User.findById(currUserId);
    console.log(user);
    return res.send(success(200, { user }));
  } catch (e) {
    console.log("error is :", e);
    res.send(error(500, e.massage));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader
        .upload(userImg, {
          folder: "profileImg",
        })
        .then(console.log("image"));
      if (!userImg) {
        console.log("image is not got", cloudImg);
      }
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    await user.save();
    console.log("updated user", { user });
    return res.send(success(200, { user }));
  } catch (e) {
    console.log("backend Error", e);
    res.send(error(500, e.massage));
  }
};
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.send(error(404, "user id is required"));
    }
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    if (!user) {
      return res.send(error(404, "user not found"));
    }

    const fullPosts = user.posts;

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {
    console.log("server error under user get user data cotroller ", e);
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollowUser,
  getPostOfFollowing,
  getMyPost,
  getUserPost,
  deleteMyProfile, // testing remaining
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
