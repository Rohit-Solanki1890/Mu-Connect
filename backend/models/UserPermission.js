const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    canAccessPremiumContent: {
      type: Boolean,
      default: false
    },
    canAccessExclusiveRooms: {
      type: Boolean,
      default: false
    },
    canAccessSecretChat: {
      type: Boolean,
      default: false
    },
    canUploadMultipleFiles: {
      type: Boolean,
      default: false
    },
    canCreatePrivateRooms: {
      type: Boolean,
      default: false
    },
    canCreateBlogs: {
      type: Boolean,
      default: false
    }
  },
  expiresAt: {
    type: Date,
    default: null,
    description: 'If null, permission is permanent. If set, expires at this date'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500
  }
}, {
  timestamps: true
});

// Check if permission is expired
userPermissionSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Revoke permission
userPermissionSchema.methods.revoke = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('UserPermission', userPermissionSchema);
