const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const { createBlog, allBlogs, updateBlog, deleteBlog, singleBlog } = require("../controllers/blogController");

router.route("/blog/all").get(allBlogs);

router.route("/blog/create").post(isAuthenticatedUser, createBlog);

router.route("/blog/:id")
.get(singleBlog)
.put(isAuthenticatedUser, updateBlog)
.delete(isAuthenticatedUser, deleteBlog);

module.exports = router;