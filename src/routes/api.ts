// src/routes/api.ts
import express from 'express';
import { ChatService } from '../services/chatService';
import { VectorStoreService } from '../services/vectorStoreService';
import { User } from '../models/User';
import { Training } from '../models/Training';
import { Project } from '../models/Project';
// Add this import at the top of src/routes/api.ts
import mongoose from 'mongoose';

const router = express.Router();
const chatService = new ChatService();
const vectorStoreService = new VectorStoreService();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Check database connection with proper typing
        const dbStatus = mongoose.connection.readyState;

        // Create a type-safe status mapping
        const dbStatusMap: { [key: number]: string } = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const dbStatusText = dbStatusMap[dbStatus] || 'unknown';

        res.json({
            status: 'OK',
            message: 'AI Recommendation API is running',
            timestamp: new Date().toISOString(),
            database: dbStatusText,
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'ERROR',
            error: error.message
        });
    }
});

// Get or create user and return welcome message
router.post('/users/:userId/chat/init', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`Initializing chat for user: ${userId}`);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const welcomeMessage = await chatService.generateWelcomeMessage(userId);

        res.json({
            success: true,
            userId,
            message: welcomeMessage,
            userProfile: {
                name: user.name,
                department: user.department,
                title: user.title,
                completedTrainings: user.completedTrainings
            }
        });
    } catch (error: any) {
        console.error('Error initializing chat:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Main chat endpoint
router.post('/users/:userId/chat', async (req, res) => {
    try {
        const { userId } = req.params;
        const { message, sessionId = 'default' } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log(`Processing message from user ${userId}: "${message}"`);
        const response = await chatService.handleUserMessage(userId, message, sessionId);

        res.json({
            success: true,
            userId,
            sessionId,
            userMessage: message,
            aiResponse: response,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error in chat:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get chat history
router.get('/users/:userId/chat/history', async (req, res) => {
    try {
        const { userId } = req.params;
        const { sessionId = 'default' } = req.query;

        const history = await chatService.getChatHistory(userId, sessionId as string);

        res.json({
            success: true,
            userId,
            sessionId,
            history: history?.messages || [],
            totalMessages: history?.messages.length || 0
        });
    } catch (error: any) {
        console.error('Error getting chat history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Clear chat history
router.delete('/users/:userId/chat/history', async (req, res) => {
    try {
        const { userId } = req.params;
        const { sessionId = 'default' } = req.body;

        await chatService.clearChatHistory(userId, sessionId);

        res.json({
            success: true,
            message: 'Chat history cleared successfully',
            userId,
            sessionId
        });
    } catch (error: any) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Admin endpoints for data management

// Index all trainings (for admin use)
router.post('/admin/index/trainings', async (req, res) => {
    try {
        console.log('Starting training indexing...');
        await vectorStoreService.indexAllTrainings();
        res.json({
            success: true,
            message: 'All trainings indexed successfully'
        });
    } catch (error: any) {
        console.error('Error indexing trainings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Index all projects (for admin use)
router.post('/admin/index/projects', async (req, res) => {
    try {
        console.log('Starting project indexing...');
        await vectorStoreService.indexAllProjects();
        res.json({
            success: true,
            message: 'All projects indexed successfully'
        });
    } catch (error: any) {
        console.error('Error indexing projects:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add new training
router.post('/admin/trainings', async (req, res) => {
    try {
        const trainingData = req.body;
        const training = new Training(trainingData);
        await training.save();

        // Auto-index the new training

        res.status(201).json({
            success: true,
            message: 'Training created and indexed successfully',
            training: {
                id: training._id,
                title: training.title,
                description: training.description
            }
        });
    } catch (error: any) {
        console.error('Error creating training:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add new project
router.post('/admin/projects', async (req, res) => {
    try {
        const projectData = req.body;
        const project = new Project(projectData);
        await project.save();

        // Auto-index the new project


        res.status(201).json({
            success: true,
            message: 'Project created and indexed successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description
            }
        });
    } catch (error: any) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user profile
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                department: user.department,
                title: user.title,
                completedTrainings: user.completedTrainings,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error: any) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;