const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalPath: {
    type: String,
    required: true,
  },
  processedVersions: {
    '360p': { type: String, default: null },
    '720p': { type: String, default: null },
  },
  thumbnail: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'ready', 'failed'],
    default: 'uploaded',
  },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);