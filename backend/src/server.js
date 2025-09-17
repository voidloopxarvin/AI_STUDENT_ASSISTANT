const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/gemini', require('./routes/gemini'));
app.use('/api/diagram', require('./routes/diagram'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/reviewer', require('./routes/reviewer'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Student Assistant API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});