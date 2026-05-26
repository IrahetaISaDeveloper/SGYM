import app from './app.js';
import { connectDB } from './database.js';
import { PORT } from './config.js';
import { startCronJobs } from './src/utils/cronJobs.js';

// Vercel Serverless environment
if (process.env.NODE_ENV === 'production') {
  connectDB();
} 
// Local development environment
else {
  connectDB().then(() => {
    startCronJobs();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// Export for Vercel
export default app;

