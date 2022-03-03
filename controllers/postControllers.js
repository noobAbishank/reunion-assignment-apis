const Post = require("../models/postModel");
const User = require("../models/userModel");

// Create Post
exports.create = async (req, res) => {
  try {
    const newPostData = {
      owner: req.user.id,
      title: req.body.title,
      description: req.body.description,
    };

    const user = await User.findById(req.user.id);

    const newPost = await Post.create(newPostData);

    user.posts.push(newPost._id);

    await user.save();

    res.status(200).json({
      success: true,
      title: newPost.title,
      description: newPost.description,
      createdAt: newPost.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Single Post
exports.singlePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        messagse: "Post Not Found",
      });
    }

    const noLikes = post.likes.length;
    const noComments = post.comments.length;
    const comments = [];

    if (post.comments.length !== 0) {
      post.comments.forEach((comment) => comments.push(comment.comment));
    }

    res.status(200).json({
      success: true,
      noLikes,
      noComments,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// all Post of a User
exports.allPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("posts");

    const allPosts = [];

    if (user.posts.length > 0) {
      for (let i = user.posts.length - 1; i >= 0; i--) {
        const comments = [];

        if (user.posts[i].comments.length > 0) {
          user.posts[i].comments.forEach((comment) => {
            comments.push(comment.comment);
          });
        }

        allPosts.push({
          id: user.posts[i].id,
          title: user.posts[i].title,
          description: user.posts[i].description,
          comments: comments.length > 0 ? comments : "No Comment Yet",
          likes:
            user.posts[i].likes.length > 0 ? user.posts[i].likes.length : 0,
          created_at: user.posts[i].createdAt,
        });
      }
    }

    res.status(200).json({
      success: true,
      posts: allPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like a Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        messagse: "Post Not Found",
      });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already Liked The Post",
      });
    }

    post.likes.push(req.user.id);

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post Liked",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unlike a Post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        messagse: "Post Not Found",
      });
    }

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You Are Already Not Liking the Post",
      });
    }

    const indexOfUser = post.likes.indexOf(req.user.id);

    post.likes.splice(indexOfUser, 1);

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post Unliked",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }

    const index = post.comments.length;

    post.comments.push({
      user: req.user.id,
      comment: req.body.comment,
    });

    await post.save();

    res.status(200).json({
      success: true,
      commentId: post.comments[index].id,
      message: "Comment Added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot Delete Other Post",
      });
    }

    const user = await User.findById(req.user.id);

    const postIndex = user.posts.indexOf(post._Id);

    user.posts.splice(postIndex, 1);

    await user.save();

    await post.remove();

    res.status(200).json({
      success: true,
      message: "Post Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
