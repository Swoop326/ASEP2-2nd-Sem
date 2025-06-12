const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'FoundItem'
  },
  itemName: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  lostPlace: {
    type: String,
    required: true
  },
  lostDate: {
    type: Date,
    required: true
  },
  proofText: {
    type: String,
    required: true
  },
  uniqueInfo: {
    type: String,
    required: true
  },
  proofImage: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

// Indexes for faster queries (optional)
claimSchema.index({ submittedAt: -1 });
claimSchema.index({ status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
