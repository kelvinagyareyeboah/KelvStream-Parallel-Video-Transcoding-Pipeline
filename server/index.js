const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can make API calls and load video streams
app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Root endpoint serving a simple testing control panel for manual verification
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>FFmpeg/HLS Transcoder Control Panel</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; background-color: #0f0f0f; color: #f1f1f1;">
        <h1 style="color: #ff0000; border-bottom: 1px solid #2f2f2f; padding-bottom: 10px; margin-bottom: 20px;">
          FFmpeg/HLS Transcoder Control Panel
        </h1>
        <p style="color: #aaa; font-size: 0.95rem;">
          Upload video files here to trigger the asynchronous transcoding pipeline. FFmpeg will segment them into multi-resolution adaptive streaming (HLS) formats.
        </p>

        <form action="/upload" method="post" enctype="multipart/form-data" style="background-color: #1f1f1f; padding: 20px; border-radius: 8px; border: 1px solid #2f2f2f; margin-top: 25px;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #eee;">Video Title:</label>
            <input type="text" name="title" required placeholder="e.g. System Design Mock Interview" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #3f3f3f; background: #2b2b2b; color: #fff; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 25px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #eee;">Video File (.mp4, .mov, etc):</label>
            <input type="file" name="video" accept="video/*" required style="width: 100%; color: #ccc;">
          </div>
          <button type="submit" style="background-color: #ff0000; color: #fff; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: bold; transition: background 0.2s;">
            Upload & Transcode Video
          </button>
        </form>

        <h2 style="margin-top: 40px; border-bottom: 1px solid #2f2f2f; padding-bottom: 8px; font-size: 1.4rem;">Transcoded Videos</h2>
        <ul id="video-list" style="list-style: none; padding: 0; margin-top: 15px;">
          <li style="color: #888;">Fetching videos...</li>
        </ul>

        <script>
          fetch('/videos')
            .then(res => res.json())
            .then(videos => {
              const list = document.getElementById('video-list');
              if (!videos || videos.length === 0) {
                list.innerHTML = '<li style="color: #666; font-style: italic;">No videos transcoded yet. Upload one above!</li>';
                return;
              }
              list.innerHTML = '';
              videos.forEach(v => {
                const li = document.createElement('li');
                li.style.cssText = 'background: #1f1f1f; border: 1px solid #2f2f2f; padding: 15px; border-radius: 6px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;';
                li.innerHTML = \`
                  <div style="font-weight: bold; font-size: 1.1rem; color: #fff;">\${v.title}</div>
                  <div style="font-family: monospace; font-size: 0.8rem; color: #888;">ID: \sub\${v.id}</div>
                  <div style="margin-top: 5px; display: flex; gap: 15px; font-size: 0.9rem;">
                    <a href="/streams/\${v.id}/master.m3u8" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: 500;">
                      🔗 Open Playlist Index (.m3u8)
                    </a>
                    <span style="color: #444;">|</span>
                    <a href="http://localhost:5173/video/\sub\${v.id}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: 500;">
                      ▶️ Play in YouTube Clone UI (Port 5173)
                    </a>
                    <span style="color: #444;">|</span>
                    <a href="http://localhost:3000/video/\sub\sub\${v.id}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: 500;">
                      ▶️ Play in YouTube Clone UI (Port 3000)
                    </a>
                  </div>
                \`.replace(/\\\\sub\\\\sub/g, '').replace(/\\\\sub/g, ''); // Unescape template literals
                list.appendChild(li);
              });
            })
            .catch(err => {
              document.getElementById('video-list').innerHTML = '<li style="color: #ff4d4d;">Failed to fetch videos from server.</li>';
            });
        </script>
      </body>
    </html>
  `);
});

// Ensure required directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TRANSCODED_DIR = path.join(__dirname, 'transcoded');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(TRANSCODED_DIR)) {
  fs.mkdirSync(TRANSCODED_DIR, { recursive: true });
}

// Serve transcoded HLS stream directories statically
app.use('/streams', express.static(TRANSCODED_DIR));

// Configure Multer to temporarily store raw video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept video file formats
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are supported.'));
    }
  }
});

// In-memory transcoding job tracker
const jobs = {};

// POST endpoint to upload video and initiate transcoding pipeline
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  const videoId = crypto.randomUUID();
  const inputFilePath = req.file.path;
  const videoTitle = req.body.title || 'Untitled Video';
  
  const outputFolder = path.join(TRANSCODED_DIR, videoId);
  const stream0Folder = path.join(outputFolder, 'stream_0');
  const stream1Folder = path.join(outputFolder, 'stream_1');

  // Create directories for video outputs and resolution subfolders
  fs.mkdirSync(outputFolder, { recursive: true });
  fs.mkdirSync(stream0Folder, { recursive: true });
  fs.mkdirSync(stream1Folder, { recursive: true });

  // Initialize job tracking status
  jobs[videoId] = {
    id: videoId,
    title: videoTitle,
    status: 'processing',
    progress: 0,
    startedAt: new Date(),
    completedAt: null,
    error: null,
    streamUrl: `http://localhost:${PORT}/streams/${videoId}/master.m3u8`
  };

  res.status(202).json({
    message: 'Video upload received. Transcoding pipeline started.',
    videoId: videoId,
    statusUrl: `http://localhost:${PORT}/status/${videoId}`
  });

  // Spawn FFmpeg to perform multi-resolution HLS transcoding asynchronously
  // Inputs:
  // - stream_0: 360p resolution scaled to 640x360 (target 800k video bitrate)
  // - stream_1: 720p resolution scaled to 1280x720 (target 2.8M video bitrate)
  // HLS parameters:
  // - Segment duration: 6 seconds
  // - Generates playlist index and master index linking both streams for Adaptive Bitrate shifting
  const ffmpegArgs = [
    '-i', inputFilePath,
    '-filter_complex', '[0:v]split=2[v1][v2]; [v1]scale=w=640:h=360[v1out]; [v2]scale=w=1280:h=720[v2out]',
    '-map', '[v1out]', '-map', '0:a', '-c:v:0', 'libx264', '-b:v:0', '800k', '-maxrate:v:0', '850k', '-bufsize:v:0', '1200k', '-c:a:0', 'aac', '-b:a:0', '96k',
    '-map', '[v2out]', '-map', '0:a', '-c:v:1', 'libx264', '-b:v:1', '2800k', '-maxrate:v:1', '2996k', '-bufsize:v:1', '4200k', '-c:a:1', 'aac', '-b:a:1', '128k',
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-hls_segment_filename', path.join(outputFolder, 'stream_%v', 'data%03d.ts'),
    '-master_pl_name', 'master.m3u8',
    '-var_stream_map', 'v:0,a:0 v:1,a:1',
    path.join(outputFolder, 'stream_%v', 'index.m3u8')
  ];

  const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

  ffmpegProcess.on('error', (err) => {
    console.error(`[Error] Failed to start FFmpeg process for video ${videoId}:`, err.message);
    jobs[videoId].status = 'failed';
    jobs[videoId].error = `FFmpeg failed to start: ${err.message}. Please make sure FFmpeg is installed and added to your system's PATH environment variable.`;
    
    // Clean up uploaded file
    try {
      if (fs.existsSync(inputFilePath)) {
        fs.unlinkSync(inputFilePath);
      }
    } catch (cleanupErr) {
      console.error('Failed to delete temporary upload file during error cleanup:', cleanupErr);
    }
  });

  ffmpegProcess.on('close', (code) => {
    // Delete the temporary uploaded file to free up local disk space
    try {
      if (fs.existsSync(inputFilePath)) {
        fs.unlinkSync(inputFilePath);
      }
    } catch (err) {
      console.error('Failed to delete temporary upload file:', err);
    }

    if (code === 0) {
      console.log(`Transcoding job succeeded for video: ${videoId}`);
      jobs[videoId].status = 'completed';
      jobs[videoId].progress = 100;
      jobs[videoId].completedAt = new Date();
    } else {
      console.error(`FFmpeg process failed with code ${code} for video ${videoId}`);
      jobs[videoId].status = 'failed';
      jobs[videoId].error = `FFmpeg transcoding failed with process exit code ${code}. Check server console for logs.`;
    }
  });

  ffmpegProcess.stderr.on('data', (data) => {
    // FFmpeg outputs progress and encoding reports to stderr
    const output = data.toString();
    console.log(`[FFmpeg Transcoder ${videoId}]: ${output.trim().split('\n')[0]}`);
  });
});

// GET endpoint to query the status of a transcoding job
app.get('/status/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job) {
    return res.status(404).json({ error: 'Video transcoding job not found.' });
  }
  res.json(job);
});

// GET endpoint to fetch list of all successfully transcoded videos
app.get('/videos', (req, res) => {
  const completedVideos = Object.values(jobs)
    .filter(job => job.status === 'completed')
    .map(job => ({
      id: job.id,
      title: job.title,
      streamUrl: job.streamUrl,
      completedAt: job.completedAt
    }));
  res.json(completedVideos);
});

app.listen(PORT, () => {
  console.log(`YouTube Transcoder Server running on port ${PORT}`);
  console.log(`- Upload endpoint: POST http://localhost:${PORT}/upload`);
  console.log(`- Static stream files served at: http://localhost:${PORT}/streams/`);
});
