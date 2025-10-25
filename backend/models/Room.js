const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    enum: ['General', 'Study', 'Gaming', 'Technology', 'Sports', 'Entertainment', 'Career', 'Other'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  maxMembers: {
    type: Number,
    default: 100,
    min: 2,
    max: 1000
  },
  messages: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [{
      type: String, // URL to uploaded file
      filename: String,
      size: Number
    }],
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId
      },
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: {
        type: String,
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceChat: {
      type: Boolean,
      default: true
    },
    allowVideoChat: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    messageRetention: {
      type: Number, // in days, 0 for unlimited
      default: 30
    }
  },
  games: [{
    type: {
      type: String,
      enum: ['tic-tac-toe', 'quiz', 'word-game'],
      required: true
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'finished'],
      default: 'waiting'
    },
    players: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      score: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    gameData: {
      type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    finishedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
roomSchema.index({ name: 'text', description: 'text' });
roomSchema.index({ category: 1 });
roomSchema.index({ tags: 1 });
roomSchema.index({ isPrivate: 1 });
roomSchema.index({ 'members.user': 1 });
roomSchema.index({ createdAt: -1 });

// Virtual for member count
roomSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for online count
roomSchema.virtual('onlineCount').get(function() {
  return this.members.filter(member => member.isOnline).length;
});

// Method to add member
roomSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => member.user.toString() === userId.toString());
  
  if (!existingMember && this.members.length < this.maxMembers) {
    this.members.push({
      user: userId,
      role: role
    });
    return true;
  }
  return false;
};

// Method to remove member
roomSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
};

// Method to update member role
roomSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  if (member) {
    member.role = newRole;
    return true;
  }
  return false;
};

// Method to add message
roomSchema.methods.addMessage = function(authorId, content, type = 'text', attachments = []) {
  this.messages.push({
    author: authorId,
    content: content,
    type: type,
    attachments: attachments
  });
  
  // Keep only recent messages based on retention policy
  if (this.settings.messageRetention > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.messageRetention);
    this.messages = this.messages.filter(msg => msg.createdAt > cutoffDate);
  }
  
  return this.messages[this.messages.length - 1];
};

// Method to start game
roomSchema.methods.startGame = function(gameType, players) {
  const game = {
    type: gameType,
    status: 'active',
    players: players.map(playerId => ({
      user: playerId,
      score: 0,
      isActive: true
    })),
    gameData: {}
  };
  
  this.games.push(game);
  return this.games[this.games.length - 1];
};

// Method to update member online status
roomSchema.methods.updateMemberStatus = function(userId, isOnline) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  if (member) {
    member.isOnline = isOnline;
    member.lastSeen = new Date();
  }
};

// Ensure virtual fields are serialized
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);

