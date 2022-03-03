const router = require("express").Router();

const {
  register,
  login,
  profile,
  follow,
  unfollow,
  logout,
} = require("../controllers/userControllers");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/register").post(register);

router.route("/authenticate").post(login);

router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/user").get(isAuthenticatedUser, profile);

router.route("/follow/:id").post(isAuthenticatedUser, follow);

router.route("/unfollow/:id").post(isAuthenticatedUser, unfollow);

module.exports = router;
