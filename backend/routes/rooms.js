const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadRoomFiles } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let query = { isActive: true };
    
    // Don't show private rooms unless user is a member
    if (!req.user) {
      query.isPrivate = false;
    } else {
      query.$or = [
        { isPrivate: false },
        { 'members.user': req.user._id }
      ];
    }
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    if (category) {
      query.category = category;
    }

    const rooms = await Room.find(query)
      .populate('creator', 'name profilePicture')
      .populate('members.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Room.countDocuments(query);

    res.json({
      success: true,
      count: rooms.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms'
    });
  }
});

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'name profilePicture bio')
      .populate('members.user', 'name profilePicture')
      .populate('messages.author', 'name profilePicture');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has access to this room
    const isMember = room.members.some(member => member.user._id.toString() === req.user._id.toString());
    const isCreator = room.creator._id.toString() === req.user._id.toString();
    
    if (room.isPrivate && !isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private room'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching room'
    });
  }
});

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private
router.post('/', [
  protect,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['General', 'Study', 'Gaming', 'Technology', 'Sports', 'Entertainment', 'Career', 'Other'])
    .withMessage('Invalid category'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 1000 })
    .withMessage('maxMembers must be between 2 and 1000')
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

    const { name, description, category, isPrivate, password, maxMembers, tags } = req.body;

    const room = await Room.create({
      name,
      description: description || '',
      creator: req.user._id,
      category: category || 'General',
      isPrivate: isPrivate || false,
      password: password || undefined,
      maxMembers: maxMembers || 100,
      tags: tags || [],
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    await room.populate('creator', 'name profilePicture bio');
    await room.populate('members.user', 'name profilePicture');

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating room'
    });
  }
});

// @desc    Join room
// @route   POST /api/rooms/:id/join
// @access  Private
router.post('/:id/join', [
  protect,
  body('password')
    .optional()
    .isString()
    .withMessage('Password must be a string')
], async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if already a member
    const isMember = room.members.some(member => member.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this room'
      });
    }

    // Check room capacity
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Check password for private rooms
    if (room.isPrivate && room.password && req.body.password !== room.password) {
      return res.status(403).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Add member
    const success = room.addMember(req.user._id);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Unable to join room'
      });
    }

    await room.save();

    // Notify room members
    const systemMessage = room.addMessage(
      req.user._id,
      `${req.user.name} joined the room`,
      'system'
    );
    await room.save();

    res.json({
      success: true,
      message: 'Successfully joined room'
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining room'
    });
  }
});

// @desc    Leave room
// @route   POST /api/rooms/:id/leave
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a member
    const isMember = room.members.some(member => member.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this room'
      });
    }

    // Don't allow creator to leave if there are other members
    if (room.creator.toString() === req.user._id.toString() && room.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Room creator cannot leave while other members are present. Transfer ownership first.'
      });
    }

    room.removeMember(req.user._id);
    
    // Add system message
    const systemMessage = room.addMessage(
      req.user._id,
      `${req.user.name} left the room`,
      'system'
    );
    
    await room.save();

    res.json({
      success: true,
      message: 'Successfully left room'
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving room'
    });
  }
});

// @desc    Send message to room
// @route   POST /api/rooms/:id/message
// @access  Private
router.post('/:id/message', [
  protect,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
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

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a member
    const isMember = room.members.some(member => member.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a member of this room.'
      });
    }

    const { content } = req.body;
    const message = room.addMessage(req.user._id, content, 'text');
    await room.save();

    await room.populate('messages.author', 'name profilePicture');

    res.json({
      success: true,
      message: room.messages[room.messages.length - 1]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @desc    Upload files to room
// @route   POST /api/rooms/:id/upload
// @access  Private
router.post('/:id/upload', [
  protect,
  uploadRoomFiles
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a member
    const isMember = room.members.some(member => member.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a member of this room.'
      });
    }

    // Check if file sharing is allowed
    if (!room.settings.allowFileSharing) {
      return res.status(403).json({
        success: false,
        message: 'File sharing is disabled in this room'
      });
    }

    // Create file attachments
    const attachments = req.files.map(file => ({
      url: `/uploads/room-files/${file.filename}`,
      filename: file.originalname,
      size: file.size
    }));

    const message = room.addMessage(
      req.user._id, 
      `Shared ${req.files.length} file(s)`, 
      'file', 
      attachments
    );
    
    await room.save();
    await room.populate('messages.author', 'name profilePicture');

    res.json({
      success: true,
      message: room.messages[room.messages.length - 1]
    });
  } catch (error) {
    console.error('Upload room files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading files'
    });
  }
});

// @desc    Update room settings
// @route   PUT /api/rooms/:id
// @access  Private (Admin/Moderator only)
router.put('/:id', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
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

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has permission to update
    const member = room.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or moderator privileges required.'
      });
    }

    const { name, description, settings } = req.body;

    if (name) room.name = name;
    if (description !== undefined) room.description = description;
    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }

    await room.save();

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating room'
    });
  }
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Creator or Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is creator or admin
    if (room.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only room creator or admin can delete room.'
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting room'
    });
  }
});

module.exports = router;
