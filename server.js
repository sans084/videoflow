const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const videoRoutes = require('./src/routes/videoRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folders
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));
app.use('/thumbnails', express.static('thumbnails'));

// Routes
app.use('/api/videos', videoRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'VideoFlow API is running 🎬' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});