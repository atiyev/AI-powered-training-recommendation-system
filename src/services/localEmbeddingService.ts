import { pipeline } from '@xenova/transformers';

// This interface is the same as before for consistency
export interface EmbeddedDocument {
    content: string;
    embedding: number[];
    metadata: {
        type: 'training' | 'project';
        id: string;
        title: string;
        department?: string;
    };
}

export class LocalEmbeddingService {
    private embeddingPipeline: any = null;

    // This function loads the embedding model (runs once on first use)
    private async getPipeline() {
        if (!this.embeddingPipeline) {
            console.log('Loading local embedding model (first time may take a moment)...');
            this.embeddingPipeline = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2'
            );
            console.log('Local embedding model loaded');
        }
        return this.embeddingPipeline;
    }

    // This function creates embeddings using the local model
    async createEmbedding(text: string): Promise<number[]> {
        try {
            console.log(`Creating local embedding for: "${text.substring(0, 50)}..."`);

            const extractor = await this.getPipeline();
            const result = await extractor(text, { pooling: 'mean', normalize: true });

            // Convert the tensor to a regular JavaScript array and ensure it's numbers
            const embeddingArray = Array.from(result.data);

            // TypeScript fix: Explicitly convert each element to number
            const embedding: number[] = embeddingArray.map(value => {
                // Convert any unknown type to number
                if (typeof value === 'number') {
                    return value;
                } else if (typeof value === 'string') {
                    return parseFloat(value);
                } else {
                    // For any other type, try to convert to number or default to 0
                    return Number(value) || 0;
                }
            });

            console.log(`Local embedding created (${embedding.length} dimensions)`);

            return embedding;
        } catch (error) {
            console.error(' Error creating local embedding:', error);
            throw error;
        }
    }

    // These preparation functions are the same as before
    prepareTrainingContent(training: any): string {
        return `
            Training: ${training.title}
            Description: ${training.description}
            Duration: ${training.duration}
            Audience: ${training.targetAudience.join(', ')}
            Type: ${training.trainingType}
            Prerequisites: ${training.prerequisites.join(', ')}
        `.trim();
    }

    prepareProjectContent(project: any): string {
        return `
            Project: ${project.name}
            Description: ${project.description}
            Status: ${project.status}
            Department: ${project.department}
            Technologies: ${project.technologies.join(', ')}
        `.trim();
    }
}
