// services/chatService.ts
import { OllamaService, ChatMessage } from './ollamaService';
import { VectorStoreService } from './vectorStoreService';
import { ConversationMemoryService } from './conversationMemoryService';
import { User } from '../models/User';
import { ChatHistory, IChatHistory } from '../models/ChatHistory';
import { Document, Types } from 'mongoose';

type ChatHistoryDocument = Document<unknown, {}, IChatHistory> & IChatHistory & { _id: Types.ObjectId };

export class ChatService {
    private ollamaService: OllamaService;
    private vectorStoreService: VectorStoreService;
    private memoryService: ConversationMemoryService;

    constructor() {
        this.ollamaService = new OllamaService();
        this.vectorStoreService = new VectorStoreService();
        this.memoryService = new ConversationMemoryService();
        console.log('Chat Service initialized with conversation memory');
    }

    // Generate personalized welcome message
    async generateWelcomeMessage(userId: string): Promise<string> {
        try {
            console.log(`Generating welcome message for user: ${userId}`);
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const welcomeMessage = `Hello ${user.name}! Welcome to the Training and Project Management Assistant. I see you're a ${user.title} in the ${user.department} department. Feel free to ask me about available trainings or projects!`;

            return welcomeMessage;
        } catch (error: any) {
            console.error('Error generating welcome message:', error.message);
            return 'Welcome! I am your AI assistant for training and project management. How can I help you today?';
        }
    }

    // Main chat method with enhanced conversation memory
    async handleUserMessage(
        userId: string,
        userMessage: string,
        sessionId: string = 'default'
    ): Promise<string> {
        try {
            console.log(`Handling user message from ${userId}: "${userMessage}"`);

            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            let chatHistory = await ChatHistory.findOne({ userId, sessionId });
            if (!chatHistory) {
                chatHistory = await this.createNewChatSession(userId, sessionId, user.department);
            }

            // Use enhanced context with memory
            const ragContext = await this.getEnhancedContext(userMessage, user, chatHistory);

            // Prepare messages with conversation memory
            const messages = this.prepareMessagesWithMemory(userMessage, ragContext, chatHistory.messages);

            // Get AI response
            console.log('Generating AI response with enhanced context...');
            const aiResponse = await this.ollamaService.generateResponse(messages, 'llama3.1:8b');

            // Save conversation
            await this.saveMessageToHistory(chatHistory, 'user', userMessage);
            await this.saveMessageToHistory(chatHistory, 'assistant', aiResponse);

            console.log(' Chat response generated with conversation memory');
            return aiResponse;

        } catch (error: any) {
            console.error(' Error handling user message:', error.message);
            throw error;
        }
    }

    // Enhanced context with conversation memory
    private async getEnhancedContext(
        userMessage: string,
        user: any,
        chatHistory: ChatHistoryDocument
    ): Promise<string> {
        let context = 'Available Information:\n\n';

        try {
            // Get conversation topics for better search
            const topics = await this.memoryService.extractConversationTopics(chatHistory);

            // Combine current query with conversation topics for better search
            const searchQuery = topics.length > 0
                ? `${userMessage} ${topics.join(' ')}`
                : userMessage;

            // Get relevant trainings and projects with enhanced query
            const trainingResults = await this.vectorStoreService.searchTrainings(searchQuery, 5);
            const projectResults = await this.vectorStoreService.searchProjects(searchQuery, 3);

            // Add conversation context if we have topics
            if (topics.length > 0) {
                context += `CONVERSATION CONTEXT: Currently discussing ${topics.join(', ')}\n\n`;
            }

            // Add summary for long conversations
            if (chatHistory.messages.length > 10) {
                const summary = await this.memoryService.summarizeConversation(chatHistory);
                context += summary;
            }

            // Training data
            if (trainingResults.length > 0) {
                context += 'TRAININGS:\n';
                trainingResults.forEach((training: any) => {
                    context += `- ${training.title}: ${training.description} (Duration: ${training.duration})\n`;
                    context += `  Prerequisites: ${training.prerequisites?.join(', ') || 'None'}\n`;
                    context += `  Audience: ${training.targetAudience?.join(', ')}\n\n`;
                });
            }

            // Project data
            if (projectResults.length > 0) {
                context += 'PROJECTS:\n';
                projectResults.forEach((project: any) => {
                    context += `- ${project.name}: ${project.description}\n`;
                    context += `  Technologies: ${project.technologies?.join(', ')}\n\n`;
                });
            }

            // User profile
            context += `USER PROFILE:\n`;
            context += `- Name: ${user.name}, Role: ${user.title} in ${user.department}\n`;
            context += `- Completed Trainings: ${user.completedTrainings?.join(', ') || 'None'}\n`;

        } catch (error) {
            console.error('Error getting enhanced context:', error);
        }

        return context;
    }

    // Enhanced message preparation with memory
    private prepareMessagesWithMemory(
        userMessage: string,
        ragContext: string,
        history: any[]
    ): ChatMessage[] {
        const systemPrompt = `You are a helpful corporate assistant for training and project management. 

IMPORTANT: Remember the ongoing conversation and maintain context across multiple messages.

Current Context:
${ragContext}

Guidelines:
- Reference earlier topics when relevant
- Be helpful and accurate with the information provided
- Do not disclose any information to one user about any other users
- If you don't have information, say so`;

        const messages: ChatMessage[] = [
            this.ollamaService.createSystemMessage(systemPrompt)
        ];

        // Include more history for better continuity (increased from 6 to 10)
        const recentHistory = history.slice(-10);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
            });
        });

        messages.push(this.ollamaService.createUserMessage(userMessage));

        return messages;
    }

    // Rest of the methods remain the same
    private async createNewChatSession(
        userId: string,
        sessionId: string,
        department: string
    ): Promise<ChatHistoryDocument> {
        const chatHistory = new ChatHistory({
            userId: new Types.ObjectId(userId),
            sessionId,
            messages: [],
            context: { userDepartment: department }
        });
        const savedHistory = await chatHistory.save();
        return savedHistory as ChatHistoryDocument;
    }

    private async saveMessageToHistory(
        chatHistory: ChatHistoryDocument,
        role: 'user' | 'assistant',
        content: string
    ): Promise<void> {
        const updatedMessages = [
            ...chatHistory.messages,
            { role, content, timestamp: new Date() }
        ];
        chatHistory.messages = updatedMessages;
        await chatHistory.save();
    }

    async getChatHistory(userId: string, sessionId: string = 'default'): Promise<ChatHistoryDocument | null> {
        return await ChatHistory.findOne({ userId, sessionId });
    }

    async clearChatHistory(userId: string, sessionId: string = 'default'): Promise<void> {
        await ChatHistory.findOneAndDelete({ userId, sessionId });
    }
}