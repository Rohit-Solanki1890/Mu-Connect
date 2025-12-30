const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const SecretChat = require('../models/SecretChat');
const UserPermission = require('../models/UserPermission');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// ===== SECRET CHAT INVITATIONS =====

// @desc    Invite user to secret chat
// @route   POST /api/admin/secret-chat/invite
// @access  Private (Admin only)
router.post('/secret-chat/invite', [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters'),
  body('expiresIn')
    .optional()
    .isIn(['1d', '7d', '30d', '90d', 'never'])
    .withMessage('Invalid expiration period')
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

    const { userId, message, expiresIn } = req.body;

    // Check if user exists
    const invitedUser = await User.findById(userId);
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate expiration date
    let expiresAt = new Date();
    if (expiresIn === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
    else if (expiresIn === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
    else if (expiresIn === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
    else if (expiresIn === '90d') expiresAt.setDate(expiresAt.getDate() + 90);
    else expiresAt = null; // never expires

    // Create secret chat invitation
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    const secretChat = await SecretChat.create({
      invitedUser: userId,
      invitedBy: req.user._id,
      accessToken,
      expiresAt,
      messages: message ? [{
        sender: req.user._id,
        content: message
      }] : []
    });

    // Send cool notification to user
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'secret_chat_invite',
      title: '🔐 Secret Chat Invitation!',
      message: `🎉 ${req.user.name} has invited you to a secret chat!${message ? ` 💬 Message: "${message}"` : ''}`,
      priority: 'high',
      data: {
        secretChatId: secretChat._id,
        accessToken
      }
    });

    res.json({
      success: true,
      message: 'Secret chat invitation sent',
      data: {
        secretChatId: secretChat._id,
        invitedUser: invitedUser.name,
        expiresAt: secretChat.expiresAt
      }
    });
  } catch (error) {
    console.error('Secret chat invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending secret chat invitation'
    });
  }
});

// @desc    Get active secret chats
// @route   GET /api/admin/secret-chats
// @access  Private (Admin only)
router.get('/secret-chats', async (req, res) => {
  try {
    const secretChats = await SecretChat.find({ invitedBy: req.user._id })
      .populate('invitedUser', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: secretChats.length,
      data: secretChats
    });
  } catch (error) {
    console.error('Get secret chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching secret chats'
    });
  }
});

// ===== USER PERMISSIONS & ACCESS CONTROL =====

// @desc    Grant permission to user
// @route   POST /api/admin/permissions/grant
// @access  Private (Admin only)
router.post('/permissions/grant', [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array'),
  body('expiresIn')
    .optional()
    .isIn(['1d', '7d', '30d', '90d', '1y', 'never'])
    .withMessage('Invalid expiration period'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters')
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

    const { userId, permissions, expiresIn, notes } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove existing permissions for this user
    await UserPermission.updateOne(
      { user: userId },
      { isActive: false }
    );

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn && expiresIn !== 'never') {
      expiresAt = new Date();
      if (expiresIn === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
      else if (expiresIn === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
      else if (expiresIn === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
      else if (expiresIn === '90d') expiresAt.setDate(expiresAt.getDate() + 90);
      else if (expiresIn === '1y') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Build permission object
    const permissionsObj = {
      canAccessPremiumContent: permissions.includes('premium'),
      canAccessExclusiveRooms: permissions.includes('exclusiveRooms'),
      canAccessSecretChat: permissions.includes('secretChat'),
      canUploadMultipleFiles: permissions.includes('multipleFiles'),
      canCreatePrivateRooms: permissions.includes('privateRooms'),
      canCreateBlogs: permissions.includes('blogs')
    };

    // Create new permission
    const userPermission = await UserPermission.create({
      user: userId,
      grantedBy: req.user._id,
      permissions: permissionsObj,
      expiresAt,
      notes
    });

    // Send notification to user
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'admin_action',
      title: '🎁 Special Access Granted!',
      message: `You've been granted special access to exclusive features!${expiresAt ? ` (Expires: ${expiresAt.toLocaleDateString()})` : ' (Permanent)'}`,
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Permissions granted successfully',
      data: {
        userId: user._id,
        userName: user.name,
        permissions: permissionsObj,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Grant permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while granting permissions'
    });
  }
});

// @desc    Revoke user permissions/access
// @route   POST /api/admin/permissions/revoke/:userId
// @access  Private (Admin only)
router.post('/permissions/revoke/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Revoke all permissions
    await UserPermission.updateMany(
      { user: req.params.userId },
      { isActive: false }
    );

    // Send notification to user
    await Notification.create({
      recipient: req.params.userId,
      sender: req.user._id,
      type: 'admin_action',
      title: '⛔ Access Revoked',
      message: 'Your special access has been revoked.',
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Permissions revoked successfully'
    });
  } catch (error) {
    console.error('Revoke permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking permissions'
    });
  }
});

// @desc    Get all granted permissions
// @route   GET /api/admin/permissions
// @access  Private (Admin only)
router.get('/permissions', async (req, res) => {
  try {
    const permissions = await UserPermission.find({ grantedBy: req.user._id, isActive: true })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permissions'
    });
  }
});

module.exports = router;
