const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const users = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const user = {
    username,
    _id: Date.now().toString(),
  };
  users.push(user);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  const newUser = users.slice(-1); // Get the last added user
  res.json(newUser);
});


const exercises = [];

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { description, duration, date } = req.body;
  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }
  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date || new Date().toDateString(),
    id: user._id
  };
  exercises.push(exercise);
  res.json({
    exercises: exercises.filter((e) => e.username === user.username),
  });
});

app.get('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const userExercises = exercises.filter((e) => e.username === user.username);

  // Format the date in the exercises using toDateString
  const formattedExercises = userExercises.map(({ username, description, duration, date, id }) => ({
    username,
    description,
    duration,
    date: new Date(date).toDateString(), // Format the date
    id
  }));

  res.json({
    exercises: formattedExercises,
  });
});




app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { from, to, limit } = req.query;

  // Filter exercises based on username and date range
  let log = exercises.filter((e) => e.username === user.username);

  if (from) {
    log = log.filter((e) => new Date(e.date) >= new Date(from));
  }
  if (to) {
    log = log.filter((e) => new Date(e.date) <= new Date(to));
  }

  // Apply the limit to the filtered exercises
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  // Format the date using toDateString
  const modifiedLog = log.map(({ description, duration, date }) => ({
    description,
    duration,
    date: new Date(date).toDateString(), // Format the date
  }));

  // Modify the response to include only the exercise details
  const response = {
    username: user.username,
    _id,
    log: modifiedLog,
  };

  if (limit) {
    response.count = modifiedLog.length;
  }

  res.json(response);
});









app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
