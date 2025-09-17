const express = require('express');
const router = express.Router();

// Placeholder for study planner
router.post('/create-plan', (req, res) => {
  res.json({
    success: true,
    message: 'Planner route ready for Phase 2',
    feature: 'AI Study Planner'
  });
});

module.exports = router;