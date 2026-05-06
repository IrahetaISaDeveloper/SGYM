import app from './app.js';
import { connectDB } from './database.js';
import { PORT } from './config.js';

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
