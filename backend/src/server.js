require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Node.js server running on port ${PORT}`);
});

// Handle unhandled promise rejections and exceptions gracefully without crashing server
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection Notice:', err.message || err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception Notice:', err.message || err);
});
