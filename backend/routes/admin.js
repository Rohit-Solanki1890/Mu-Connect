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

// @desc    Get pending user registrations (not approved)
// @route   GET /api/admin/pending-users
// @access  Private (Admin only)
router.get('/pending-users', async (req, res) => {
  try {
    console.log('📡 Fetching pending users...');
    const pendingUsers = await User.find({ isApproved: false })
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${pendingUsers.length} pending users`);
    res.json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    console.error('❌ Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending users'
    });
  }
});

// @desc    Approve user registration
// @route   POST /api/admin/approve-user/:id
// @access  Private (Admin only)
router.post('/approve-user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    // Approve the user
    user.isApproved = true;
    await user.save();

    // Send approval email
    try {
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        email: user.email,
        subject: 'Account Approved - CloseNet',
        message: `
          <h2>Account Approved!</h2>
          <p>Hello ${user.name},</p>
          <p>Your account has been approved by the admin. You can now login to CloseNet.</p>
          <a href="${process.env.CLIENT_URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
          <p>Welcome to CloseNet!</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving user'
    });
  }
});

// @desc    Reject user registration
// @route   POST /api/admin/reject-user/:id
// @access  Private (Admin only)
router.post('/reject-user/:id', [
  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved user'
      });
    }

    const { reason } = req.body;

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    // Send rejection email
    try {
      const { sendEmail } = require('../utils/emailService');
      const emailMessage = reason 
        ? `<p><strong>Reason:</strong> ${reason}</p>`
        : '';
      
      await sendEmail({
        email: user.email,
        subject: 'Registration Not Approved - CloseNet',
        message: `
          <h2>Registration Decision</h2>
          <p>Hello ${user.name},</p>
          <p>Unfortunately, your registration request has not been approved.</p>
          ${emailMessage}
          <p>If you have questions, please contact the admin.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'User registration rejected successfully'
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting user'
    });
  }
});

// @desc    Grant special access to user (Premium, Moderator, Content Creator)
// @route   POST /api/admin/grant-access/:id
// @access  Private (Admin only)
router.post('/grant-access/:id', [
  body('accessType')
    .isIn(['premium', 'moderator', 'content_creator'])
    .withMessage('Invalid access type'),
  body('permanent')
    .isBoolean()
    .withMessage('Permanent must be boolean'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
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

    const { accessType, permanent, expiresAt } = req.body;

    user.specialAccess = {
      type: accessType,
      permanent: permanent,
      expiresAt: permanent ? undefined : new Date(expiresAt)
    };

    await user.save();

    res.json({
      success: true,
      message: `Special access (${accessType}) granted to ${user.name}`,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while granting access'
    });
  }
});

// @desc    Revoke special access from user
// @route   POST /api/admin/revoke-access/:id
// @access  Private (Admin only)
router.post('/revoke-access/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.specialAccess) {
      return res.status(400).json({
        success: false,
        message: 'User does not have special access'
      });
    }

    user.specialAccess = undefined;
    await user.save();

    res.json({
      success: true,
      message: `Special access revoked from ${user.name}`,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking access'
    });
  }
});

// @desc    Send secret chat invitation to user
// @route   POST /api/admin/send-secret-invite/:id
// @access  Private (Admin only)
router.post('/send-secret-invite/:id', [
  body('message')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
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

    const admin = await User.findById(req.user.id);
    const { message } = req.body;

    // Create a secret chat invitation notification
    const notification = new Notification({
      recipient: user._id,
      sender: admin._id,
      type: 'secret_chat_invite',
      title: `Secret Chat Invitation from ${admin.name}`,
      description: message,
      isRead: false,
      relatedData: {
        invitedBy: admin._id,
        inviteMessage: message,
        sentAt: new Date()
      }
    });

    await notification.save();

    // Send email notification
    try {
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        email: user.email,
        subject: `Secret Chat Invitation from ${admin.name}`,
        message: `
          <h2>Secret Chat Invitation</h2>
          <p>Hello ${user.name},</p>
          <p><strong>${admin.name}</strong> has invited you to a secret chat!</p>
          <p><em>"${message}"</em></p>
          <a href="${process.env.CLIENT_URL}/secret-chats" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Invitation</a>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: `Secret chat invitation sent to ${user.name}`,
      data: {
        recipientId: user._id,
        invitedBy: admin._id,
        message: message
      }
    });
  } catch (error) {
    console.error('Send secret invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending invite'
    });
  }
});

module.exports = router;

