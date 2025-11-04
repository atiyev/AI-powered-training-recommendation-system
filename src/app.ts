// src/app.ts
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { connectDB } from './config/database';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AI Training Recommendation API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            chat: 'POST /api/users/:userId/chat',
            history: 'GET /api/users/:userId/chat/history',
            admin: {
                indexTrainings: 'POST /api/admin/index/trainings',
                indexProjects: 'POST /api/admin/index/projects'
            }
        }
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Start server
async function startServer() {
    try {
        console.log(' Connecting to database...');
        await connectDB();

        console.log(' Starting server...');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(` API Base URL: http://localhost:${PORT}`);
            console.log(` Health check: http://localhost:${PORT}/api/health`);
            console.log(` Chat endpoint: POST http://localhost:${PORT}/api/users/:userId/chat`);
        });
    } catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
}

// Only start server if this file is run directly
if (require.main === module) {
    startServer();
}

export default app;