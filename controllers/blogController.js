const Blog = require("../models/blogModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

//View all blogs
exports.allBlogs = catchAsyncError(async (req, res, next) => {

    const blogs = await Blog.find();

    res.status(200).json({
        success: true,
        blogs
    });
});

//Get Single blog
exports.singleBlog = catchAsyncError(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if(!blog){
        return next(new ErrorHandler("Blog not found", 404));
    }

    res.status(200).json({
        success: true,
        blog,
    });
});

//Create Blog
exports.createBlog = catchAsyncError(async (req, res, next) => {
    const { title, content } = req.body;
    const author = req.user.name;
    const authorId = req.user._id;

    const newBlog = new Blog({
        title,
        content,
        author,
        authorId,
    });

    const savedBlog = await newBlog.save();

    res.status(200).json({
        success: true,
        savedBlog,
        message: "Blog created successfully"
    });
});

// Update Blog
exports.updateBlog = catchAsyncError(async (req, res, next) => {
    const { title, content } = req.body;
    const authorId = req.user._id;

    const updatedBlog = await Blog.findOneAndUpdate(
        { _id: req.params.id, authorId },
        { title, content },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    );

    if (!updatedBlog) {
        return next(new ErrorHandler("Blog not found", 404));
    }

    res.status(200).json({
        success: true,
        updatedBlog,
        message: "Blog updated successfully"
    });
});


//Delete Blog
exports.deleteBlog = catchAsyncError(async (req, res, next) => {

    const authorId = req.user._id;

    const deletedBlog = await Blog.findOneAndDelete({ _id: req.params.id, authorId });

    if (!deletedBlog) {
        return next(new ErrorHandler("Blog not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Blog deleted successfully"
    });

});