const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const filename = `levelguess${Date.now()}${fileExtension}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/upload', upload.single('thumbnail'), (req, res) => {
  const difficulty = req.body.difficulty;
  const answer = req.body.answer;
  const file = req.file;

  if (!file || !difficulty || !answer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const levelData = {
    Difficulty: difficulty,
    Thumbnail: `api/image?src=uploads/${file.filename}`,
    Answer: answer,
  };

  let levels = [];
  try {
    const levelsData = fs.readFileSync('levels.json');
    levels = JSON.parse(levelsData);
  } catch (err) {
    console.error("Error reading levels.json:", err);
  }

  levels.push(levelData);

  fs.writeFileSync('levels.json', JSON.stringify(levels, null, 2));

  res.json(levelData);
});

app.get('/api/image', (req, res) => {
  const src = req.query.src;
  const filePath = path.join(__dirname, 'uploads', src);
  res.sendFile(filePath);
});

app.get('/levels', (req, res) => {
  fs.readFile('levels.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    const levels = JSON.parse(data);
    res.json(levels);
  });
});

app.get('/guess', (req, res) => {
  fs.readFile('levels.json', (err, data) => {
    let levels = [];
    if (!err && data) {
      levels = JSON.parse(data);
    }
    if (levels.length === 0) {
      return res.status(404).json({ error: 'No levels available' });
    }
    const randomLevelIndex = Math.floor(Math.random() * levels.length);
    const randomLevel = levels[randomLevelIndex];
    res.json(randomLevel);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
