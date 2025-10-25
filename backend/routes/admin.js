const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Blog = require('../models/Blog');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Post.countDocuments(),
      Post.countDocuments({ isReported: true }),
      Blog.countDocuments(),
      Blog.countDocuments({ isPublished: true }),
      Room.countDocuments(),
      Room.countDocuments({ isActive: true }),
      Notification.countDocuments()
    ]);

    const [totalUsers, activeUsers, adminUsers, totalPosts, reportedPosts, totalBlogs, publishedBlogs, totalRooms, activeRooms, totalNotifications] = stats;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          inactive: totalUsers - activeUsers
        },
        posts: {
          total: totalPosts,
          reported: reportedPosts
        },
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          drafts: totalBlogs - publishedBlogs
        },
        rooms: {
          total: totalRooms,
          active: activeRooms,
          inactive: totalRooms - activeRooms
        },
        notifications: totalNotifications
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin stats'
    });
  }
});

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
router.put('/users/:id', [
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { role, isActive } = req.body;

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @desc    Get reported posts
// @route   GET /api/admin/reports/posts
// @access  Private (Admin only)
router.get('/reports/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isReported: true })
      .populate('author', 'name profilePicture email')
      .populate('reports.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ isReported: true });

    res.json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reported posts'
    });
  }
});

// @desc    Take action on reported content
// @route   POST /api/admin/reports/:type/:id/action
// @access  Private (Admin only)
router.post('/reports/:type/:id/action', [
  body('action')
    .isIn(['approve', 'remove', 'warn'])
    .withMessage('Invalid action'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot be more than 500 characters')
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

    const { type, id } = req.params;
    const { action, reason } = req.body;

    let model;
    if (type === 'post') model = Post;
    else if (type === 'blog') model = Blog;
    else {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    const content = await model.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (action === 'approve') {
      content.isReported = false;
      content.reports = [];
    } else if (action === 'remove') {
      await model.findByIdAndDelete(id);
      return res.json({
        success: true,
        message: 'Content removed successfully'
      });
    } else if (action === 'warn') {
      // Send warning notification to author
      await Notification.createNotification(
        content.author,
        req.user._id,
        'admin_action',
        'Content Warning',
        `Your ${type} has received a warning from administration. Reason: ${reason || 'Violation of community guidelines'}`,
        { contentId: content._id, contentType: type }
      );
    }

    await content.save();

    res.json({
      success: true,
      message: `Action ${action} taken successfully`
    });
  } catch (error) {
    console.error('Take action on report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while taking action'
    });
  }
});

// @desc    Manage rooms
// @route   GET /api/admin/rooms
// @access  Private (Admin only)
router.get('/rooms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const rooms = await Room.find({})
      .populate('creator', 'name profilePicture email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Room.countDocuments();

    res.json({
      success: true,
      count: rooms.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rooms
    });
  } catch (error) {
    console.error('Get admin rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms'
    });
  }
});

// @desc    Deactivate/Activate room
// @route   PUT /api/admin/rooms/:id/toggle
// @access  Private (Admin only)
router.put('/rooms/:id/toggle', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    room.isActive = !room.isActive;
    await room.save();

    res.json({
      success: true,
      message: `Room ${room.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: room.isActive
    });
  } catch (error) {
    console.error('Toggle room status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling room status'
    });
  }
});

// @desc    Send announcement to all users
// @route   POST /api/admin/announcement
// @access  Private (Admin only)
router.post('/announcement', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
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

    const { title, message } = req.body;

    // Get all active users
    const users = await User.find({ isActive: true }).select('_id');
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: 'admin_action',
      title: title,
      message: message,
      priority: 'high'
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Announcement sent to ${users.length} users`
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending announcement'
    });
  }
});

module.exports = router;
