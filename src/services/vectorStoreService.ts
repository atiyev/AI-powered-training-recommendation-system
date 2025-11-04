// services/vectorStoreService.ts
import { LocalEmbeddingService } from './localEmbeddingService';
import { Training } from '../models/Training';
import { Project } from '../models/Project';

export class VectorStoreService {
    private embeddingService: LocalEmbeddingService;

    constructor() {
        this.embeddingService = new LocalEmbeddingService();
    }

    // Index all trainings
    async indexAllTrainings(): Promise<void> {
        try {
            console.log('Indexing all trainings...');
            const trainings = await Training.find();

            for (const training of trainings) {
                const content = this.embeddingService.prepareTrainingContent(training);
                const embedding = await this.embeddingService.createEmbedding(content);

                await Training.findByIdAndUpdate(training._id, { vectorEmbedding: embedding });
                console.log(` Indexed: "${training.title}"`);
            }

            console.log(' All trainings indexed');
        } catch (error) {
            console.error(' Error indexing trainings:', error);
            throw error;
        }
    }

    // Index all projects
    async indexAllProjects(): Promise<void> {
        try {
            console.log(' Indexing all projects...');
            const projects = await Project.find();

            for (const project of projects) {
                const content = this.embeddingService.prepareProjectContent(project);
                const embedding = await this.embeddingService.createEmbedding(content);

                await Project.findByIdAndUpdate(project._id, { vectorEmbedding: embedding });
                console.log(` Indexed: "${project.name}"`);
            }

            console.log(' All projects indexed');
        } catch (error) {
            console.error(' Error indexing projects:', error);
            throw error;
        }
    }

    // Search trainings - simplified
    async searchTrainings(query: string, limit: number = 5): Promise<any[]> {
        try {
            console.log(` Searching trainings for: "${query}"`);
            const queryEmbedding = await this.embeddingService.createEmbedding(query);

            const allTrainings = await Training.find({ vectorEmbedding: { $exists: true, $ne: null } });

            const results = allTrainings
                .map(training => ({
                    training,
                    similarity: this.calculateCosineSimilarity(queryEmbedding, training.vectorEmbedding || [])
                }))
                .filter(item => item.similarity > 0.3)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit)
                .map(item => ({
                    id: item.training._id.toString(),
                    title: item.training.title,
                    description: item.training.description,
                    duration: item.training.duration,
                    targetAudience: item.training.targetAudience,
                    prerequisites: item.training.prerequisites,
                    similarity: item.similarity
                }));

            return results;
        } catch (error) {
            console.error(' Error searching trainings:', error);
            return [];
        }
    }

    // Search projects - simplified
    async searchProjects(query: string, limit: number = 5): Promise<any[]> {
        try {
            console.log(` Searching projects for: "${query}"`);
            const queryEmbedding = await this.embeddingService.createEmbedding(query);

            const allProjects = await Project.find({ vectorEmbedding: { $exists: true, $ne: null } });

            const results = allProjects
                .map(project => ({
                    project,
                    similarity: this.calculateCosineSimilarity(queryEmbedding, project.vectorEmbedding || [])
                }))
                .filter(item => item.similarity > 0.3)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit)
                .map(item => ({
                    id: item.project._id.toString(),
                    name: item.project.name,
                    description: item.project.description,
                    keyFeatures: item.project.keyFeatures,
                    technologies: item.project.technologies,
                    similarity: item.similarity
                }));

            return results;
        } catch (error) {
            console.error(' Error searching projects:', error);
            return [];
        }
    }

    // Cosine similarity calculation
    private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length === 0 || vec2.length === 0 || vec1.length !== vec2.length) {
            return 0;
        }

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}