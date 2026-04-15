# 🎬 VideoFlow - Video Processing & Streaming API

A production-ready REST API for video upload, processing, and streaming built with Node.js and FFmpeg.

## 🌐 Live Demo

Base URL: `https://videoflow-l0jv.onrender.com`

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/api/videos/upload` | POST | Upload video |
| `/api/videos` | GET | Get all videos |
| `/api/videos/:id` | GET | Get video by ID |
| `/api/videos/:id/stream?quality=360p` | GET | Stream video |
| `/api/videos/:id/stream?quality=720p` | GET | Stream 720p |

## 🚀 Features

- 📤 Video upload with file validation
- 🎞️ Automatic transcoding to multiple resolutions (360p, 720p)
- 🖼️ Auto thumbnail generation from video frames
- 📊 Video metadata extraction (duration, size, bitrate)
- 🎥 HTTP video streaming with range request support
- 💾 MongoDB storage for video metadata
- ⚡ Background processing (non-blocking uploads)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| FFmpeg + fluent-ffmpeg | Video encoding & processing |
| MongoDB + Mongoose | Metadata storage |
| Multer | Video file upload handling |
| UUID | Unique file naming |

## 📁 Project Structure

```
videoflow/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Business logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # File upload handling
│   └── utils/          # FFmpeg utilities
├── uploads/            # Original videos
├── processed/          # Transcoded videos
├── thumbnails/         # Auto-generated thumbnails
└── server.js           # Entry point
```

## ⚙️ Installation

1. Clone the repository
```bash
git clone https://github.com/sans084/videoflow.git
cd videoflow
```

2. Install dependencies
```bash
npm install
```

3. Install FFmpeg
- Download from https://ffmpeg.org/download.html
- Add to system PATH

4. Create `.env` file
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
```

5. Run the server
```bash
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/videos/upload` | Upload a video |
| GET | `/api/videos` | Get all videos |
| GET | `/api/videos/:id` | Get video by ID |
| GET | `/api/videos/:id/stream` | Stream video |
| DELETE | `/api/videos/:id` | Delete video |

## 🎥 Streaming

Stream video with quality selection:
GET /api/videos/:id/stream?quality=360p
GET /api/videos/:id/stream?quality=720p

Supports HTTP range requests for video seeking.

## 📊 Video Processing Pipeline
Upload → Validate → Save to DB → Background Processing
↓
Extract Metadata
↓
Generate Thumbnail
↓
Transcode to 360p
↓
Transcode to 720p
↓
Status → "ready"


## 🔧 Environment Variables

| Variable | Description |
|---|---|
| PORT | Server port (default: 5000) |
| MONGO_URI | MongoDB Atlas connection string |