const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadBlogImages, processImage } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const featured = req.query.featured === 'true';

    let query = { isPublished: true, isReported: false };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.featured = true;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePicture bio college year')
      .populate('comments.author', 'name profilePicture')
      .populate('likes.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      count: blogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blogs'
    });
  }
});

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
// @access  Private
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profilePicture bio college year')
      .populate('comments.author', 'name profilePicture')
      .populate('likes.user', 'name profilePicture');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    await blog.incrementViews();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blog'
    });
  }
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
router.post('/', [
  protect,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['Technology', 'Education', 'Lifestyle', 'Career', 'Personal', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Invalid visibility setting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, category, tags, visibility } = req.body;

    const blog = await Blog.create({
      author: req.user._id,
      title,
      content,
      excerpt,
      category: category || 'Other',
      tags: tags || [],
      visibility: visibility || 'public'
    });

    await blog.populate('author', 'name profilePicture bio college year');

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating blog'
    });
  }
});

// @desc    Upload blog cover image
// @route   POST /api/blogs/:id/cover-image
// @access  Private
router.post('/:id/cover-image', [
  protect,
  uploadBlogImages,
  processImage
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user owns the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    // Set cover image
    blog.coverImage = `/uploads/blog-images/${req.files[0].filename}`;
    await blog.save();

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      coverImage: blog.coverImage
    });
  } catch (error) {
    console.error('Upload blog cover image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading cover image'
    });
  }
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
router.put('/:id', [
  protect,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['Technology', 'Education', 'Lifestyle', 'Career', 'Personal', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Invalid visibility setting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user owns the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    const { title, content, excerpt, category, tags, visibility } = req.body;

    if (title) blog.title = title;
    if (content) {
      blog.content = content;
      blog.isEdited = true;
      blog.editedAt = new Date();
    }
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (visibility) blog.visibility = visibility;

    await blog.save();
    await blog.populate('author', 'name profilePicture bio college year');

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating blog'
    });
  }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting blog'
    });
  }
});

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const isLiked = blog.addLike(req.user._id);
    await blog.save();

    // Create notification if someone else liked the blog
    if (isLiked && blog.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification(
        blog.author,
        req.user._id,
        'like',
        'New Like',
        `${req.user.name} liked your blog "${blog.title}"`,
        { blogId: blog._id }
      );
    }

    res.json({
      success: true,
      message: isLiked ? 'Blog liked' : 'Blog unliked',
      isLiked,
      likeCount: blog.likeCount
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking blog'
    });
  }
});

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comment
// @access  Private
router.post('/:id/comment', [
  protect,
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const { content } = req.body;
    const comment = blog.addComment(req.user._id, content);
    await blog.save();

    await blog.populate('comments.author', 'name profilePicture');

    // Create notification if someone else commented on the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification(
        blog.author,
        req.user._id,
        'comment',
        'New Comment',
        `${req.user.name} commented on your blog "${blog.title}"`,
        { blogId: blog._id, commentId: comment._id }
      );
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: blog.comments[blog.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
});

// @desc    Report blog
// @route   POST /api/blogs/:id/report
// @access  Private
router.post('/:id/report', [
  protect,
  body('reason')
    .isIn(['spam', 'inappropriate', 'harassment', 'fake', 'other'])
    .withMessage('Invalid report reason'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const { reason, description } = req.body;
    blog.reportBlog(req.user._id, reason, description);
    await blog.save();

    res.json({
      success: true,
      message: 'Blog reported successfully'
    });
  } catch (error) {
    console.error('Report blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting blog'
    });
  }
});

module.exports = router;

