// services/conversationMemoryService.ts
import { ChatHistory, IChatHistory } from '../models/ChatHistory';
import { OllamaService } from './ollamaService';

export class ConversationMemoryService {
    private ollamaService: OllamaService;

    constructor() {
        this.ollamaService = new OllamaService();
    }

    // Summarize long conversation history
    async summarizeConversation(chatHistory: IChatHistory): Promise<string> {
        if (chatHistory.messages.length <= 10) {
            return ''; // No need to summarize short conversations
        }

        const conversationText = chatHistory.messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n')
            .substring(0, 4000); // Limit length

        const summaryPrompt = `Please provide a brief summary of the key topics discussed in this conversation. Focus on:
- Training courses discussed
- Projects mentioned  
- User's interests and questions
- Any decisions or conclusions reached

Conversation:
${conversationText}

Summary:`;

        try {
            const summary = await this.ollamaService.generateResponseWithSystemPrompt(
                'You are a conversation summarizer. Create concise summaries focusing on key topics and decisions.',
                summaryPrompt,
                'llama3.1:8b'
            );
            return `PREVIOUS CONVERSATION SUMMARY:\n${summary}\n\n`;
        } catch (error) {
            console.error('Error summarizing conversation:', error);
            return '';
        }
    }

    // Extract key topics from conversation
    async extractConversationTopics(chatHistory: IChatHistory): Promise<string[]> {
        const recentMessages = chatHistory.messages.slice(-8); // Last 8 messages

        const conversationText = recentMessages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        const topicPrompt = `Extract the main topics being discussed in this conversation. Return as a simple comma-separated list.

Conversation:
${conversationText}

Topics:`;

        try {
            const topicsResponse = await this.ollamaService.generateResponseWithSystemPrompt(
                'Extract key topics from conversations. Return only comma-separated topics.',
                topicPrompt,
                'llama3.1:8b'
            );

            return topicsResponse.split(',').map(topic => topic.trim()).filter(Boolean);
        } catch (error) {
            console.error('Error extracting topics:', error);
            return [];
        }
    }
}