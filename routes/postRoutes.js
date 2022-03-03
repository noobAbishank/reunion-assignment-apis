const router = require("express").Router();

const {
  create,
  likePost,
  unlikePost,
  addComment,
  singlePost,
  allPosts,
  deletePost,
} = require("../controllers/postControllers");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/posts/").post(isAuthenticatedUser, create);

router
  .route("/posts/:id")
  .get(singlePost)
  .delete(isAuthenticatedUser, deletePost);

router.route("/all_posts/").get(isAuthenticatedUser, allPosts);

router.route("/like/:id").post(isAuthenticatedUser, likePost);

router.route("/unlike/:id").post(isAuthenticatedUser, unlikePost);

router.route("/comment/:id").post(isAuthenticatedUser, addComment);

module.exports = router;
