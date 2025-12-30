const mongoose = require('mongoose');

const secretChatSchema = new mongoose.Schema({
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    description: 'Secret chat invitation expires after this time'
  },
  accessToken: {
    type: String,
    unique: true,
    sparse: true
  },
  isAutomaticallyExpired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check if expired
secretChatSchema.methods.checkExpiry = function() {
  if (!this.isAutomaticallyExpired && new Date() > this.expiresAt) {
    this.status = 'expired';
    this.isAutomaticallyExpired = true;
  }
  return this.status !== 'expired';
};

module.exports = mongoose.model('SecretChat', secretChatSchema);
