// services/ollamaService.ts
import axios from 'axios';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Define response interfaces
interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

interface OllamaTagsResponse {
    models: Array<{
        name: string;
        modified_at: string;
        size: number;
        digest: string;
    }>;
}

export class OllamaService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        console.log(' Ollama Service initialized');
    }
// Add this method to your OllamaService class
    async generateResponseWithSystemPrompt(
        systemPrompt: string,
        userMessage: string,
        model: string = 'llama3.1:8b',
        temperature: number = 0.7
    ): Promise<string> {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userMessage
            }
        ];

        return this.generateResponse(messages, model, temperature);
    }
    // Optional: Health check method
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axios.get<OllamaTagsResponse>(`${this.baseUrl}/api/tags`);
            console.log(' Ollama is running and accessible');
            return true;
        } catch (error: any) {
            console.error(' Ollama health check failed:', error.message);
            return false;
        }
    }

    // Optional: List available models
    async listAvailableModels(): Promise<string[]> {
        try {
            const response = await axios.get<OllamaTagsResponse>(`${this.baseUrl}/api/tags`);
            const models = response.data.models.map((model) => model.name);
            console.log(' Available models:', models);
            return models;
        } catch (error: any) {
            console.error(' Error fetching available models:', error.message);
            return [];
        }
    }

    async generateResponse(
        messages: ChatMessage[],
        model: string = 'llama3.1:8b',
        temperature: number = 0.7
    ): Promise<string> {
        try {
            console.log(`Generating response using ${model}...`);

            const response = await axios.post<OllamaResponse>(`${this.baseUrl}/api/chat`, {
                model,
                messages,
                stream: false,
                options: { temperature }
            });

            const aiResponse = response.data.message.content;
            console.log(' AI response generated successfully');
            return aiResponse;

        } catch (error: any) {
            console.error(' Error generating AI response:', error.message);
            throw new Error(`Failed to generate AI response: ${error.message}`);
        }
    }

    // Helper methods
    createUserMessage(content: string): ChatMessage {
        return { role: 'user', content };
    }

    createAssistantMessage(content: string): ChatMessage {
        return { role: 'assistant', content };
    }

    createSystemMessage(content: string): ChatMessage {
        return { role: 'system', content };
    }
}