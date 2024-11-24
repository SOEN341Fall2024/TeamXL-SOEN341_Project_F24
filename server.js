// server.js
import app from './app.js';

const port = 3000;

// Start the server for production/development use
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

afterAll((done) => {
  createApp(mockDb).close(() => {
    done();
  });
});
