import { Schema, model, Document } from 'mongoose';

export interface ITraining extends Document {
    title: string;
    description: string;
    duration: string; 
    targetAudience: string[]; 
    prerequisites: string[]; 
    vectorEmbedding?: number[];
}

const trainingSchema = new Schema<ITraining>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    targetAudience: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] }, 
    vectorEmbedding: { type: [Number], default: undefined }
}, {
    timestamps: true
});

export const Training = model<ITraining>('Training', trainingSchema);
