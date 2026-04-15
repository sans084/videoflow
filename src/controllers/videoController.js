const Video = require('../models/Video');
const { transcodeVideo, generateThumbnail, getVideoMetadata } = require('../utils/ffmpeg');
const path = require('path');
const fs = require('fs');

// Upload and process video
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const { title } = req.body;
    const inputPath = req.file.path;
    const filename = req.file.filename;
    const nameWithoutExt = path.parse(filename).name;

    // Create video record in DB
    const video = new Video({
      title: title || req.file.originalname,
      originalName: req.file.originalname,
      filename: filename,
      originalPath: inputPath,
      status: 'processing',
    });
    await video.save();

    // Send response immediately — processing happens in background
    res.status(201).json({
      message: 'Video uploaded! Processing started...',
      videoId: video._id,
      status: 'processing',
    });

    // Background processing
    (async () => {
      try {
        // Get metadata
        const metadata = await getVideoMetadata(inputPath);
        video.duration = metadata.duration;
        video.size = metadata.size;

        // Generate thumbnail
        const thumbnailPath = path.join('thumbnails', `${nameWithoutExt}.png`);
        await generateThumbnail(inputPath, thumbnailPath);
        video.thumbnail = thumbnailPath;

        // Transcode to 360p
        const output360 = path.join('processed', `${nameWithoutExt}_360p.mp4`);
        await transcodeVideo(inputPath, output360, '360p');
        video.processedVersions['360p'] = output360;

        // Transcode to 720p
        const output720 = path.join('processed', `${nameWithoutExt}_720p.mp4`);
        await transcodeVideo(inputPath, output720, '720p');
        video.processedVersions['720p'] = output720;

        // Mark as ready
        video.status = 'ready';
        await video.save();
        console.log(`Video ${video._id} processing complete ✅`);

      } catch (err) {
        video.status = 'failed';
        await video.save();
        console.error('Processing failed:', err.message);
      }
    })();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all videos
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single video by ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stream video
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const quality = req.query.quality || '360p';
    const videoPath = video.processedVersions[quality] || video.originalPath;

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Partial content for seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      fileStream.pipe(res);
    } else {
      // Full video
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete files
    const filesToDelete = [
      video.originalPath,
      video.thumbnail,
      video.processedVersions['360p'],
      video.processedVersions['720p'],
    ];

    filesToDelete.forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  streamVideo,
  deleteVideo,
};