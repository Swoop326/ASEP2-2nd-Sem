const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  status: {
    type: String,
    default: 'unclaimed'
  },
  reporter: {
    contact: {
      type: String,
      default: ''
    }
  },
  claimedBy: {
    fullName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  }
});

module.exports = mongoose.model('Item', itemSchema);