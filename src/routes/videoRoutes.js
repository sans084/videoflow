const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadVideo,
  getAllVideos,
  getVideoById,
  streamVideo,
  deleteVideo,
} = require('../controllers/videoController');

// Upload a video
router.post('/upload', upload.single('video'), uploadVideo);

// Get all videos
router.get('/', getAllVideos);

// Get single video by ID
router.get('/:id', getVideoById);

// Stream video (add ?quality=360p or ?quality=720p)
router.get('/:id/stream', streamVideo);

// Delete video
router.delete('/:id', deleteVideo);

module.exports = router;