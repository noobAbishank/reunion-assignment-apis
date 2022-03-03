const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");

// Register a new User
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, 201, res, "Account Created Successfully");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    sendToken(user, 200, res, "Login Successfully");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const noOfFollowers = user.followers.length;
    const noOfFollowings = user.followings.length;

    res.status(200).json({
      success: true,
      username: user.username,
      noOfFollowers,
      noOfFollowings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Follow  a User
exports.follow = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "User Cannot Follow Himself/Herself",
    });
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (loggedInUser.followings.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: "Already Followed This User",
      });
    }

    loggedInUser.followings.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: "User Followed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unfollow
exports.unfollow = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "User Cannot Unfollow Himself/Herself",
    });
  }

  try {
    const userToUnfollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (!loggedInUser.followings.includes(userToUnfollow._id)) {
      return res.status(400).json({
        success: false,
        message: "You Are Not Following The User",
      });
    }

    const indexFollowing = loggedInUser.followings.indexOf(userToUnfollow._id);
    const indexFollower = userToUnfollow.followers.indexOf(loggedInUser._id);

    loggedInUser.followings.splice(indexFollowing, 1);
    userToUnfollow.followers.splice(indexFollower, 1);

    await loggedInUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: "User Unfollowed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
