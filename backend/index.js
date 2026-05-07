import app from './app.js';
import { connectDB } from './database.js';
import { PORT } from './config.js';

// Vercel Serverless environment
if (process.env.NODE_ENV === 'production') {
  connectDB();
} 
// Local development environment
else {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// Export for Vercel
export default app;
