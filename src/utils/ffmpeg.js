const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Transcode video to a specific resolution
const transcodeVideo = (inputPath, outputPath, resolution) => {
  return new Promise((resolve, reject) => {
    const scaleMap = {
      '360p': 'scale=640:360',
      '720p': 'scale=1280:720',
    };

    ffmpeg(inputPath)
      .videoFilter(scaleMap[resolution])
      .audioCodec('aac')
      .videoCodec('libx264')
      .outputOptions([
        '-preset fast',
        '-crf 23',
        '-movflags +faststart', // Enables streaming before full download
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log(`Starting ${resolution} transcode...`);
      })
      .on('progress', (progress) => {
        console.log(`Processing ${resolution}: ${Math.floor(progress.percent || 0)}% done`);
      })
      .on('end', () => {
        console.log(`${resolution} transcode complete ✅`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error(`Transcode error (${resolution}):`, err.message);
        reject(err);
      })
      .run();
  });
};

// Generate thumbnail from video
const generateThumbnail = (inputPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    const folder = path.dirname(thumbnailPath);
    const filename = path.basename(thumbnailPath);

    ffmpeg(inputPath)
      .screenshots({
        count: 1,
        folder: folder,
        filename: filename,
        timemarks: ['00:00:02'], // Take screenshot at 2 seconds
      })
      .on('end', () => {
        console.log('Thumbnail generated ✅');
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        console.error('Thumbnail error:', err.message);
        reject(err);
      });
  });
};

// Get video duration and metadata
const getVideoMetadata = (inputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          duration: metadata.format.duration,
          size: metadata.format.size,
          bitrate: metadata.format.bit_rate,
        });
      }
    });
  });
};

module.exports = { transcodeVideo, generateThumbnail, getVideoMetadata };