const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get conversations (list of users you've messaged)
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
      .populate('sender', 'name profilePicture bio lastActive')
      .populate('recipient', 'name profilePicture bio lastActive')
      .sort({ createdAt: -1 });

    // Get unique conversations
    const conversationMap = new Map();
    
    messages.forEach(msg => {
      const otherUserId = msg.sender._id.toString() === req.user._id.toString() 
        ? msg.recipient._id 
        : msg.sender._id;
      
      if (!conversationMap.has(otherUserId.toString())) {
        const otherUser = msg.sender._id.toString() === req.user._id.toString() 
          ? msg.recipient 
          : msg.sender;
        
        conversationMap.set(otherUserId.toString(), {
          _id: otherUser._id,
          name: otherUser.name,
          profilePicture: otherUser.profilePicture,
          bio: otherUser.bio,
          lastActive: otherUser.lastActive,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: msg.recipient._id.toString() === req.user._id.toString() && !msg.isRead ? 1 : 0
        });
      }
    });

    // Count unread messages per conversation
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          recipient: req.user._id,
          isRead: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));

    const conversations = Array.from(conversationMap.values()).map(conv => ({
      ...conv,
      unreadCount: unreadMap.get(conv._id.toString()) || 0
    })).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations'
    });
  }
});

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Get messages between users
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: req.params.userId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    });

    res.json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @desc    Send a message
// @route   POST /api/messages/send/:recipientId
// @access  Private
router.post('/send/:recipientId', protect, [
  body('content').trim().notEmpty().withMessage('Message content is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Check if recipient exists
    const recipient = await User.findById(req.params.recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if user is blocked
    if (recipient.blockedUsers && recipient.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot message this user'
      });
    }

    const message = new Message({
      sender: req.user._id,
      recipient: req.params.recipientId,
      content: req.body.content,
      image: req.body.image || null
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');
    await message.populate('recipient', 'name profilePicture');

    // Create notification for recipient
    await Notification.create({
      user: req.params.recipientId,
      type: 'message',
      sender: req.user._id,
      title: `New message from ${req.user.name}`,
      message: req.body.content.substring(0, 100),
      link: `/messages/${req.user._id}`
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
