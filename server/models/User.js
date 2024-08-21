const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // find api ke anadr passward nahi jaega
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    avatar: {
      pulicId: String,
      url: String
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // mongoose ke anadar do schema ko apas me relete karana ho to
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("user", userSchema);
