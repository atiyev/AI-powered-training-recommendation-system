import { Schema, model, Document } from 'mongoose';

export interface ITraining extends Document {
    title: string;
    description: string;
    duration: string; // e.g., "2 hours", "1 day"
    targetAudience: string[]; // departments or positions that should take this
    prerequisites: string[]; // training IDs that must be completed first
    vectorEmbedding?: number[];
}

const trainingSchema = new Schema<ITraining>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    targetAudience: { type: [String], default: [] }, // e.g., ["Engineering", "Marketing"]
    prerequisites: { type: [String], default: [] }, // References to other training IDs
    vectorEmbedding: { type: [Number], default: undefined }
}, {
    timestamps: true
});

export const Training = model<ITraining>('Training', trainingSchema);