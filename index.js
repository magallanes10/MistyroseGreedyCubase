const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true
}));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const filename = `levelguess${Date.now()}${fileExtension}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

function requireLogin(req, res, next) {
  if (req.path === '/api/image' || req.path === '/upload') {
    return next();
  }
  if (req.session && req.session.username) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'gdps' && password === 'ccproject10') {
    req.session.username = username;
    res.redirect('/dashboard');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/upload', requireLogin, upload.single('thumbnail'), (req, res) => {
  const difficulty = req.body.difficulty;
  const answer = req.body.answer;
  const file = req.file;

  if (!file || !difficulty || !answer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const levelData = {
    Difficulty: difficulty,
    Thumbnail: `api/image?src=/uploads/${file.filename}`,
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

app.get('/levels', requireLogin, (req, res) => {
  fs.readFile('levels.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    const levels = JSON.parse(data);
    res.json(levels);
  });
});

app.delete('/levels/:id', requireLogin, (req, res) => {
  const levelId = req.params.id;

  fs.readFile('levels.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    let levels = JSON.parse(data);
    if (levelId >= 0 && levelId < levels.length) {
      levels.splice(levelId, 1); 
      fs.writeFileSync('levels.json', JSON.stringify(levels, null, 2));
      res.json({ message: 'Level deleted successfully' });
    } else {
      res.status(404).json({ error: 'Level not found' });
    }
  });
});

app.put('/levels/:id', requireLogin, (req, res) => {
  const levelId = req.params.id;
  const { Difficulty, Answer } = req.body;

  fs.readFile('levels.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    let levels = JSON.parse(data);
    if (levelId >= 0 && levelId < levels.length) {
      levels[levelId].Difficulty = Difficulty;
      levels[levelId].Answer = Answer;
      fs.writeFileSync('levels.json', JSON.stringify(levels, null, 2));
      res.json({ message: 'Level updated successfully' });
    } else {
      res.status(404).json({ error: 'Level not found' });
    }
  });
});

app.get('/api/image', requireLogin, (req, res) => {
  const src = req.query.src;
  const filePath = path.join(__dirname, src);
  res.sendFile(filePath);
});

app.get('/guess', (req, res) => {
  fs.readFile('levels.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read levels' });
    }

    let levels = [];
    try {
      levels = JSON.parse(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to parse levels JSON' });
    }

    if (levels.length === 0) {
      return res.status(404).json({ error: 'No levels available' });
    }

    const randomLevelIndex = Math.floor(Math.random() * levels.length);
    const randomLevel = levels.splice(randomLevelIndex, 1)[0];
    res.json(randomLevel);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
