import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/message', (_req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
